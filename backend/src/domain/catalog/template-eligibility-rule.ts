import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { RuleOperator } from "./enums"

interface EligibilityRuleProps {
  attributeId: Identifier
  operator: RuleOperator
  value: unknown
}

/**
 * An attribute-based access rule that gates who may use a template
 * (e.g. attribute "degree" IN ["MSc", "PhD"]). Evaluated against a user's
 * resolved attribute value.
 */
export class TemplateEligibilityRule extends Entity {
  private constructor(id: Identifier, private props: EligibilityRuleProps) {
    super(id)
  }

  static create(id: Identifier, p: EligibilityRuleProps): TemplateEligibilityRule {
    return new TemplateEligibilityRule(id, p)
  }

  static rehydrate(id: Identifier, props: EligibilityRuleProps): TemplateEligibilityRule {
    return new TemplateEligibilityRule(id, props)
  }

  get attributeId(): Identifier { return this.props.attributeId }

  /** Evaluate this rule against the user's value for the referenced attribute. */
  isSatisfiedBy(actual: unknown): boolean {
    const expected = this.props.value
    switch (this.props.operator) {
      case RuleOperator.EQ: return actual === expected
      case RuleOperator.NEQ: return actual !== expected
      case RuleOperator.IN: return Array.isArray(expected) && expected.includes(actual)
      case RuleOperator.GTE: return Number(actual) >= Number(expected)
      case RuleOperator.LTE: return Number(actual) <= Number(expected)
      default: return false
    }
  }

  snapshot(): {
    id: string
    attributeId: string
    operator: RuleOperator
    value: unknown
  } {
    return {
      id: this.id.toString(),
      attributeId: this.props.attributeId.toString(),
      operator: this.props.operator,
      value: this.props.value,
    }
  }
}
