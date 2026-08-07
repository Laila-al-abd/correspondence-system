import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { TEMPLATE_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { ReorderTemplateFieldsCommand } from './reorder-template-fields.command'

export interface ReorderTemplateFieldsResult {
  templateId: string
  fieldKeys: string[]
}

/**
 * Sets the order a template's fields are presented in. The aggregate refuses a
 * list that does not name every field exactly once, so the result is always a
 * total order with no shared ordinals.
 */
@CommandHandler(ReorderTemplateFieldsCommand)
export class ReorderTemplateFieldsHandler
  implements
    ICommandHandler<ReorderTemplateFieldsCommand, ReorderTemplateFieldsResult>
{
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templates: TemplateRepository,
  ) {}

  async execute({
    input,
  }: ReorderTemplateFieldsCommand): Promise<ReorderTemplateFieldsResult> {
    const template = await this.templates.findById(Identifier.of(input.templateId))
    if (!template) throw new EntityNotFoundError('Template', input.templateId)

    template.reorderFields(input.fieldKeys)
    await this.templates.save(template)

    return {
      templateId: template.id.toString(),
      fieldKeys: template.fields.map((field) => field.fieldKey),
    }
  }
}
