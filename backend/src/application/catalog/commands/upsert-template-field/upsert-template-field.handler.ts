import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import { Identifier } from '../../../../domain/shared/identifier'
import { ID_GENERATOR, TEMPLATE_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import {
  buildTemplateField,
  templateFieldProps,
} from '../template-field.factory'
import { UpsertTemplateFieldCommand } from './upsert-template-field.command'

export interface UpsertTemplateFieldResult {
  templateId: string
  fieldKey: string
  created: boolean
  ordinal: number
}

/**
 * Adds a field, or redefines the one already declared under that key.
 *
 * One command rather than separate add and edit, because the caller's intent is
 * the same in both cases -- "this template should have this field, defined this
 * way" -- and an author who cannot remember whether a key already exists would
 * otherwise get a 409 for asking the obvious question.
 *
 * Redefinition keeps the field's row id, so nothing that referenced the field
 * by id is orphaned, and keeps its key, since the key is what stored answers
 * and prediction rows are written against.
 */
@CommandHandler(UpsertTemplateFieldCommand)
export class UpsertTemplateFieldHandler
  implements ICommandHandler<UpsertTemplateFieldCommand, UpsertTemplateFieldResult>
{
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templates: TemplateRepository,
    @Inject(ID_GENERATOR)
    private readonly ids: IdGenerator,
  ) {}

  async execute({
    input,
  }: UpsertTemplateFieldCommand): Promise<UpsertTemplateFieldResult> {
    const template = await this.templates.findById(Identifier.of(input.templateId))
    if (!template) throw new EntityNotFoundError('Template', input.templateId)

    const existing = template.field(input.field.key)
    const ordinal =
      input.ordinal ?? existing?.ordinal ?? template.nextOrdinal()

    if (existing) {
      existing.redefine(templateFieldProps(input.field, ordinal))
    } else {
      template.addField(
        buildTemplateField(this.ids.next(), input.field, ordinal),
      )
    }

    await this.templates.save(template)

    return {
      templateId: template.id.toString(),
      fieldKey: input.field.key,
      created: !existing,
      ordinal,
    }
  }
}
