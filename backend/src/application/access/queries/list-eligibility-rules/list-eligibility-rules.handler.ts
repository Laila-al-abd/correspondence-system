import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import type { AttributeDefinitionRepository } from '../../../../domain/catalog/ports/attribute-definition.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import {
  ATTRIBUTE_DEFINITION_REPOSITORY,
  TEMPLATE_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { EligibilityRuleView } from '../views/eligibility-rule.view'
import { ListEligibilityRulesQuery } from './list-eligibility-rules.query'

/**
 * Lists the ABAC eligibility rules of one template, resolving each rule's
 * attribute id back to its human-readable code for display.
 */
@QueryHandler(ListEligibilityRulesQuery)
export class ListEligibilityRulesHandler
  implements IQueryHandler<ListEligibilityRulesQuery, EligibilityRuleView[]>
{
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templates: TemplateRepository,
    @Inject(ATTRIBUTE_DEFINITION_REPOSITORY)
    private readonly attributes: AttributeDefinitionRepository,
  ) {}

  async execute({
    templateId,
  }: ListEligibilityRulesQuery): Promise<EligibilityRuleView[]> {
    const template = await this.templates.findById(Identifier.of(templateId))
    if (!template) throw new EntityNotFoundError('Template', templateId)

    const definitions = await this.attributes.list()
    const codeById = new Map(
      definitions.map((def) => [def.id.toString(), def.code]),
    )

    return template.snapshot().eligibilityRules.map((rule) => ({
      id: rule.id,
      templateId,
      attributeId: rule.attributeId,
      attributeCode: codeById.get(rule.attributeId) ?? null,
      operator: rule.operator,
      value: rule.value,
    }))
  }
}
