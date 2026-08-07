import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { TEMPLATE_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { RemoveTemplateFieldCommand } from './remove-template-field.command'

export interface RemoveTemplateFieldResult {
  templateId: string
  fieldKey: string
  remainingFields: number
}

/**
 * Removes a field from a template's definition.
 *
 * Answers already stored against the key are left where they are, so submitted
 * history stays readable. The live consequence is on requests of this type that
 * are still awaiting confirmation: their stored key is no longer declared, so
 * confirmation will report it as not part of the template until the requester
 * resubmits. Removing a field from a busy template is therefore an authoring
 * decision with a blast radius, not a tidy-up.
 */
@CommandHandler(RemoveTemplateFieldCommand)
export class RemoveTemplateFieldHandler
  implements ICommandHandler<RemoveTemplateFieldCommand, RemoveTemplateFieldResult>
{
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templates: TemplateRepository,
  ) {}

  async execute({
    input,
  }: RemoveTemplateFieldCommand): Promise<RemoveTemplateFieldResult> {
    const template = await this.templates.findById(Identifier.of(input.templateId))
    if (!template) throw new EntityNotFoundError('Template', input.templateId)

    template.removeField(input.fieldKey)
    await this.templates.save(template)

    return {
      templateId: template.id.toString(),
      fieldKey: input.fieldKey,
      remainingFields: template.fields.length,
    }
  }
}
