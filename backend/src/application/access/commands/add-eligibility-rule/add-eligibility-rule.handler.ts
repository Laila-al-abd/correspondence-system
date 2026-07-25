import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import type { AttributeDefinitionRepository } from '../../../../domain/catalog/ports/attribute-definition.repository'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import { Identifier } from '../../../../domain/shared/identifier'
import { TemplateEligibilityRule } from '../../../../domain/catalog/template-eligibility-rule'
import { RuleOperator } from '../../../../domain/catalog/enums'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import {
  ATTRIBUTE_DEFINITION_REPOSITORY,
  ID_GENERATOR,
  TEMPLATE_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { EligibilityRuleView } from '../../queries/views/eligibility-rule.view'
import { AddEligibilityRuleCommand } from './add-eligibility-rule.command'

/**
 * Adds an ABAC eligibility rule to a template. Resolves the attribute by its
 * code, checks the value is shaped correctly for the operator, then lets the
 * Template aggregate enforce its own invariant (one rule per attribute). The
 * repository rewrites the template's rule set transactionally.
 */
@CommandHandler(AddEligibilityRuleCommand)
export class AddEligibilityRuleHandler
  implements ICommandHandler<AddEligibilityRuleCommand, EligibilityRuleView>
{
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templates: TemplateRepository,
    @Inject(ATTRIBUTE_DEFINITION_REPOSITORY)
    private readonly attributes: AttributeDefinitionRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async execute({
    input,
  }: AddEligibilityRuleCommand): Promise<EligibilityRuleView> {
    const template = await this.templates.findById(
      Identifier.of(input.templateId),
    )
    if (!template) throw new EntityNotFoundError('Template', input.templateId)

    const definition = await this.attributes.findByCode(input.attributeCode)
    if (!definition)
      throw new EntityNotFoundError('Attribute definition', input.attributeCode)

    const operator = input.operator as RuleOperator
    assertValueMatchesOperator(operator, input.value)

    const rule = TemplateEligibilityRule.create(this.ids.next(), {
      attributeId: definition.id,
      operator,
      value: input.value,
    })
    template.addEligibilityRule(rule)
    await this.templates.save(template)

    return {
      id: rule.snapshot().id,
      templateId: input.templateId,
      attributeId: definition.id.toString(),
      attributeCode: definition.code,
      operator,
      value: input.value,
    }
  }
}

/** Guards that the value is usable by the chosen operator before persisting. */
function assertValueMatchesOperator(
  operator: RuleOperator,
  value: unknown,
): void {
  if (operator === RuleOperator.IN) {
    if (!Array.isArray(value))
      throw new InvariantViolationError(
        'The IN operator requires an array value.',
      )
    return
  }
  if (operator === RuleOperator.GTE || operator === RuleOperator.LTE) {
    if (typeof value !== 'number')
      throw new InvariantViolationError(
        `The ${operator} operator requires a numeric value.`,
      )
    return
  }
  if (value === undefined || value === null)
    throw new InvariantViolationError('A rule value is required.')
}
