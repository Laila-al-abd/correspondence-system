import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import type {
  RequestCategoryRepository,
  SensitivityLevelRepository,
} from '../../../../domain/catalog/ports/catalog-lookup.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { LocalizedText } from '../../../../domain/shared/localized-text'
import {
  REQUEST_CATEGORY_REPOSITORY,
  SENSITIVITY_LEVEL_REPOSITORY,
  TEMPLATE_REPOSITORY,
} from '../../../tokens'
import {
  EntityNotFoundError,
  TemplateCodeAlreadyInUseError,
} from '../../../errors'
import { UpdateTemplateCommand } from './update-template.command'

export interface UpdateTemplateResult {
  id: string
  code?: string
  isActive: boolean
}

/**
 * Edits a template's own attributes. Fields are authored through their own
 * commands, so a text correction cannot accidentally rewrite the form.
 *
 * Retiring is a deactivation, never a delete: requests, workflow paths and
 * ml_predictions all refer to a template long after it stops being offered, and
 * a request whose template vanished could not be validated, confirmed or even
 * explained to the person who submitted it. Deactivation removes it from the
 * classifier's catalogue and from new submissions while leaving history intact.
 */
@CommandHandler(UpdateTemplateCommand)
export class UpdateTemplateHandler
  implements ICommandHandler<UpdateTemplateCommand, UpdateTemplateResult>
{
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templates: TemplateRepository,
    @Inject(REQUEST_CATEGORY_REPOSITORY)
    private readonly categories: RequestCategoryRepository,
    @Inject(SENSITIVITY_LEVEL_REPOSITORY)
    private readonly sensitivityLevels: SensitivityLevelRepository,
  ) {}

  async execute({ input }: UpdateTemplateCommand): Promise<UpdateTemplateResult> {
    const template = await this.templates.findById(Identifier.of(input.templateId))
    if (!template) throw new EntityNotFoundError('Template', input.templateId)
    const before = template.snapshot()

    if (input.categoryId !== undefined) {
      const categoryId = Identifier.of(input.categoryId)
      if (!(await this.categories.findById(categoryId)))
        throw new EntityNotFoundError('Request category', input.categoryId)
      template.setCategory(categoryId)
    }

    if (input.sensitivityLevelId !== undefined) {
      const sensitivityLevelId = Identifier.of(input.sensitivityLevelId)
      if (!(await this.sensitivityLevels.findById(sensitivityLevelId)))
        throw new EntityNotFoundError(
          'Sensitivity level',
          input.sensitivityLevelId,
        )
      template.setSensitivityLevel(sensitivityLevelId)
    }

    if (input.code !== undefined) {
      const code = input.code.trim().toUpperCase()
      const holder = await this.templates.findByCode(code)
      if (holder && holder.id.toString() !== template.id.toString())
        throw new TemplateCodeAlreadyInUseError(code)
      // Refuses a change when a different code is already assigned.
      template.assignCode(code)
    }

    const touchesText =
      input.titleAr !== undefined ||
      input.titleEn !== undefined ||
      input.descriptionAr !== undefined ||
      input.descriptionEn !== undefined

    if (touchesText) {
      const title = LocalizedText.create(
        input.titleAr ?? before.title.ar,
        input.titleEn ?? before.title.en,
      )
      const descriptionAr =
        input.descriptionAr === undefined
          ? before.description?.ar
          : input.descriptionAr
      const descriptionEn =
        input.descriptionEn === undefined
          ? before.description?.en
          : input.descriptionEn
      template.setText(
        title,
        descriptionAr
          ? LocalizedText.create(descriptionAr, descriptionEn)
          : undefined,
      )
    }

    if (input.defaultPriority !== undefined)
      template.setDefaultPriority(input.defaultPriority)

    if (input.classifierDocument !== undefined)
      template.setClassifierDocument(input.classifierDocument ?? undefined)

    if (input.isActive !== undefined) {
      if (input.isActive) template.activate()
      else template.deactivate()
    }

    await this.templates.save(template)

    return {
      id: template.id.toString(),
      code: template.code,
      isActive: template.isActive,
    }
  }
}
