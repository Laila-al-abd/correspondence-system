import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Template } from '../../../../domain/catalog/template'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import type {
  RequestCategoryRepository,
  SensitivityLevelRepository,
} from '../../../../domain/catalog/ports/catalog-lookup.repository'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import { Identifier } from '../../../../domain/shared/identifier'
import { LocalizedText } from '../../../../domain/shared/localized-text'
import {
  ID_GENERATOR,
  REQUEST_CATEGORY_REPOSITORY,
  SENSITIVITY_LEVEL_REPOSITORY,
  TEMPLATE_REPOSITORY,
} from '../../../tokens'
import {
  EntityNotFoundError,
  TemplateCodeAlreadyInUseError,
} from '../../../errors'
import { buildTemplateField } from '../template-field.factory'
import { CreateTemplateCommand } from './create-template.command'

export interface CreateTemplateResult {
  id: string
  code?: string
  fieldCount: number
}

/**
 * Authors a new request type.
 *
 * A template is created inactive-safe rather than draft-safe: it is active from
 * the start (the aggregate says so), but it has no workflow path until one is
 * defined for it, and StartRequestWorkflowHandler refuses a request whose
 * template has no active path. So an unfinished template cannot strand a
 * request halfway; it can only fail to start one, loudly.
 *
 * The category and sensitivity level are checked to exist before anything is
 * written, because both are foreign keys and a Prisma constraint error surfaces
 * as a 500 that tells the author nothing about which id was wrong.
 */
@CommandHandler(CreateTemplateCommand)
export class CreateTemplateHandler
  implements ICommandHandler<CreateTemplateCommand, CreateTemplateResult>
{
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templates: TemplateRepository,
    @Inject(REQUEST_CATEGORY_REPOSITORY)
    private readonly categories: RequestCategoryRepository,
    @Inject(SENSITIVITY_LEVEL_REPOSITORY)
    private readonly sensitivityLevels: SensitivityLevelRepository,
    @Inject(ID_GENERATOR)
    private readonly ids: IdGenerator,
  ) {}

  async execute({ input }: CreateTemplateCommand): Promise<CreateTemplateResult> {
    let categoryId: Identifier | undefined
    if (input.categoryId !== undefined) {
      categoryId = Identifier.of(input.categoryId)
      if (!(await this.categories.findById(categoryId)))
        throw new EntityNotFoundError('Request category', input.categoryId)
    }

    let sensitivityLevelId: Identifier | undefined
    if (input.sensitivityLevelId !== undefined) {
      sensitivityLevelId = Identifier.of(input.sensitivityLevelId)
      if (!(await this.sensitivityLevels.findById(sensitivityLevelId)))
        throw new EntityNotFoundError('Sensitivity level', input.sensitivityLevelId)
    }

    if (input.code) {
      const code = input.code.trim().toUpperCase()
      if (await this.templates.findByCode(code))
        throw new TemplateCodeAlreadyInUseError(code)
    }

    const template = Template.create(this.ids.next(), {
      code: input.code,
      categoryId,
      sensitivityLevelId,
      title: LocalizedText.create(input.titleAr, input.titleEn),
      description: input.descriptionAr
        ? LocalizedText.create(input.descriptionAr, input.descriptionEn)
        : undefined,
      defaultPriority: input.defaultPriority,
      classifierDocument: input.classifierDocument,
    })

    for (const [index, field] of (input.fields ?? []).entries()) {
      template.addField(buildTemplateField(this.ids.next(), field, index + 1))
    }

    await this.templates.save(template)

    return {
      id: template.id.toString(),
      code: template.code,
      fieldCount: template.fields.length,
    }
  }
}
