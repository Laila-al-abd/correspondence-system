import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { TEMPLATE_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { RemoveEligibilityRuleCommand } from './remove-eligibility-rule.command'

/**
 * Removes an eligibility rule from a template. 404s if either the template or
 * the rule is unknown, then persists the reduced rule set.
 */
@CommandHandler(RemoveEligibilityRuleCommand)
export class RemoveEligibilityRuleHandler
  implements ICommandHandler<RemoveEligibilityRuleCommand, void>
{
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templates: TemplateRepository,
  ) {}

  async execute({ input }: RemoveEligibilityRuleCommand): Promise<void> {
    const template = await this.templates.findById(
      Identifier.of(input.templateId),
    )
    if (!template) throw new EntityNotFoundError('Template', input.templateId)

    const exists = template
      .snapshot()
      .eligibilityRules.some((rule) => rule.id === input.ruleId)
    if (!exists)
      throw new EntityNotFoundError('Eligibility rule', input.ruleId)

    template.removeEligibilityRule(Identifier.of(input.ruleId))
    await this.templates.save(template)
  }
}
