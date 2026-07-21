import { AggregateRoot } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
import { InvariantViolationError } from "../shared/domain-error"
import { TemplateField } from "./template-field"
import { TemplateEligibilityRule } from "./template-eligibility-rule"

interface TemplateProps {
  categoryId: Identifier
  title: LocalizedText
  description?: LocalizedText
  sensitivityLevelId: Identifier
  isActive: boolean
  fields: TemplateField[]
  eligibilityRules: TemplateEligibilityRule[]
}

/**
 * A request-type definition: its form fields, who is eligible to submit it, and
 * its sensitivity. The aggregate keeps a template internally consistent — field
 * keys are unique, and submissions are checked against required fields.
 */
export class Template extends AggregateRoot {
  private constructor(id: Identifier, private props: TemplateProps) {
    super(id)
  }

  static create(
    id: Identifier,
    p: {
      categoryId: Identifier
      title: LocalizedText
      sensitivityLevelId: Identifier
      description?: LocalizedText
    },
  ): Template {
    return new Template(id, {
      categoryId: p.categoryId,
      title: p.title,
      description: p.description,
      sensitivityLevelId: p.sensitivityLevelId,
      isActive: true,
      fields: [],
      eligibilityRules: [],
    })
  }

  static rehydrate(id: Identifier, props: TemplateProps): Template {
    return new Template(id, props)
  }

  addField(field: TemplateField): void {
    if (this.props.fields.some((f) => f.fieldKey === field.fieldKey))
      throw new InvariantViolationError(`Duplicate field key "${field.fieldKey}" in template.`)
    this.props.fields.push(field)
  }

  addEligibilityRule(rule: TemplateEligibilityRule): void {
    if (this.props.eligibilityRules.some((r) => r.attributeId === rule.attributeId))
      throw new InvariantViolationError(`Duplicate attribute key "${rule.attributeId}" in template.`)
    this.props.eligibilityRules.push(rule)

  }

  activate(): void { this.props.isActive = true }
  deactivate(): void { this.props.isActive = false }

  get isActive(): boolean { return this.props.isActive }
  get categoryId(): Identifier { return this.props.categoryId }
  get sensitivityLevelId(): Identifier { return this.props.sensitivityLevelId }
  get fields(): readonly TemplateField[] { return this.props.fields }

  /**
   * Ensures a submission provides an acceptable value for every field.
   * Returns the offending field keys (empty array = valid submission).
   */
  validateSubmission(filledData: Record<string, unknown>): string[] {
    return this.props.fields
      .filter((f) => !f.accepts(filledData[f.fieldKey]))
      .map((f) => f.fieldKey)
  }

  /**
   * ABAC gate: a user is eligible when every rule is satisfied by their resolved
   * attribute values, keyed by attribute id.
   */
  isEligible(userAttributes: Map<string, unknown>): boolean {
    return this.props.eligibilityRules.every((rule) =>
      rule.isSatisfiedBy(userAttributes.get(rule.attributeId.toString())),
    )
  }

  snapshot(): {
    categoryId: string
    title: { ar: string; en?: string }
    description?: { ar: string; en?: string }
    sensitivityLevelId: string
    isActive: boolean
    fields: ReturnType<TemplateField["snapshot"]>[]
    eligibilityRules: ReturnType<TemplateEligibilityRule["snapshot"]>[]
  } {
    return {
      categoryId: this.props.categoryId.toString(),
      title: this.props.title.toJSON(),
      description: this.props.description?.toJSON(),
      sensitivityLevelId: this.props.sensitivityLevelId.toString(),
      isActive: this.props.isActive,
      fields: this.props.fields.map((f) => f.snapshot()),
      eligibilityRules: this.props.eligibilityRules.map((r) => r.snapshot()),
    }
  }
}
