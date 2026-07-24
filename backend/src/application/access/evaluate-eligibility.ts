import type { Identifier } from '../../domain/shared/identifier'
import type { Template } from '../../domain/catalog/template'
import type { AttributeDefinitionRepository } from '../../domain/catalog/ports/attribute-definition.repository'
import type { UserAttributeRepository } from '../../domain/identity/ports/user-attribute.repository'

/** One eligibility rule the user's attributes fail to satisfy. */
export interface UnmetRuleView {
  attributeId: string
  attributeCode?: string
  operator: string
  value: unknown
}

/** The result of evaluating a template's ABAC rules against a user. */
export interface TemplateEligibilityView {
  userId: string
  templateId: string
  eligible: boolean
  unmetRules: UnmetRuleView[]
}

/**
 * The ABAC evaluation engine. It resolves a user's attribute values (keyed by
 * attribute id), then asks each template whether every eligibility rule is
 * satisfied. Deny-by-default: a rule that references an attribute the user does
 * not hold is treated as unmet.
 */
export class EvaluateEligibility {
  constructor(
    private readonly userAttributes: UserAttributeRepository,
    private readonly attributeDefinitions: AttributeDefinitionRepository,
  ) {}

  /** Builds the { attributeId -> value } map the Template aggregate expects. */
  async resolveAttributes(userId: Identifier): Promise<Map<string, unknown>> {
    const held = await this.userAttributes.listForUser(userId)
    return new Map(
      held.map((attribute) => [
        attribute.attributeId.toString(),
        attribute.value,
      ]),
    )
  }

  /** attributeId -> human-readable code, for explaining unmet rules. */
  async attributeCodeMap(): Promise<Map<string, string>> {
    const definitions = await this.attributeDefinitions.list()
    return new Map(definitions.map((def) => [def.id.toString(), def.code]))
  }

  /** Resolves the user's attributes, then evaluates one template. */
  async evaluate(
    userId: Identifier,
    template: Template,
  ): Promise<TemplateEligibilityView> {
    const attributes = await this.resolveAttributes(userId)
    return this.evaluateWith(userId, template, attributes)
  }

  /** Evaluates one template against already-resolved attributes (batch-friendly). */
  async evaluateWith(
    userId: Identifier,
    template: Template,
    attributes: Map<string, unknown>,
    codeByAttributeId?: Map<string, string>,
  ): Promise<TemplateEligibilityView> {
    const codes = codeByAttributeId ?? (await this.attributeCodeMap())
    const unmetRules: UnmetRuleView[] = template
      .unmetEligibilityRules(attributes)
      .map((rule) => ({
        attributeId: rule.attributeId,
        attributeCode: codes.get(rule.attributeId),
        operator: rule.operator,
        value: rule.value,
      }))
    return {
      userId: userId.toString(),
      templateId: template.id.toString(),
      eligible: unmetRules.length === 0,
      unmetRules,
    }
  }
}
