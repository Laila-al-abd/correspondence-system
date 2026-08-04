import { AggregateRoot } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
import { InvariantViolationError } from "../shared/domain-error"
import { TemplateField } from "./template-field"
import { TemplateEligibilityRule } from "./template-eligibility-rule"

/** One thing wrong with a submitted form, and why it is wrong. */
export interface FilledDataViolation {
  fieldKey: string
  reason: string
}

interface TemplateProps {
  /** Stable machine name (ENROLL_CERT); optional until an admin assigns one. */
  code?: string
  categoryId: Identifier
  title: LocalizedText
  description?: LocalizedText
  sensitivityLevelId: Identifier
  isActive: boolean
  /**
   * The exact Arabic text the classifier embeds. Deliberately separate from
   * `description`: that is prose for people, this is an input to a model that
   * was measured against these exact characters.
   */
  classifierDocument?: string
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
      code?: string
      classifierDocument?: string
    },
  ): Template {
    return new Template(id, {
      code: p.code ? Template.normaliseCode(p.code) : undefined,
      classifierDocument: p.classifierDocument,
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

  removeEligibilityRule(ruleId: Identifier): void {
    const before = this.props.eligibilityRules.length
    this.props.eligibilityRules = this.props.eligibilityRules.filter(
      (r) => r.id.toString() !== ruleId.toString(),
    )
    if (this.props.eligibilityRules.length === before)
      throw new InvariantViolationError(`Eligibility rule "${ruleId.toString()}" not found in template.`)
  }

  /**
   * Codes are write-once. Renaming one would silently break every stored
   * measurement and every AI-service mapping that refers to the old name, and
   * nothing in the system would report the break.
   */
  assignCode(code: string): void {
    const next = Template.normaliseCode(code)
    if (this.props.code && this.props.code !== next)
      throw new InvariantViolationError(
        `Template code "${this.props.code}" cannot be changed once assigned.`,
      )
    this.props.code = next
  }

  /** Replaces the text the classifier embeds. Changing it changes classification. */
  setClassifierDocument(document?: string): void {
    const trimmed = document?.trim()
    this.props.classifierDocument = trimmed ? trimmed : undefined
  }

  private static normaliseCode(code: string): string {
    const next = code.trim().toUpperCase()
    if (!/^[A-Z][A-Z0-9_]{1,49}$/.test(next))
      throw new InvariantViolationError(
        `Template code "${code}" must be 2-50 characters of A-Z, 0-9 and underscore, starting with a letter.`,
      )
    return next
  }

  get code(): string | undefined { return this.props.code }
  get classifierDocument(): string | undefined { return this.props.classifierDocument }

  activate(): void { this.props.isActive = true }
  deactivate(): void { this.props.isActive = false }

  get isActive(): boolean { return this.props.isActive }
  get categoryId(): Identifier { return this.props.categoryId }
  get sensitivityLevelId(): Identifier { return this.props.sensitivityLevelId }
  get fields(): readonly TemplateField[] { return this.props.fields }

  /**
   * Checks a submission against this template's declared fields and returns
   * every problem at once, rather than stopping at the first.
   *
   * Two rules, both deliberate:
   *  - every declared field must hold an acceptable value (required fields must
   *    be present; every value must match its declared type);
   *  - no key may appear that the template did not declare. Silently storing
   *    unknown keys means filled_data drifts away from template_fields, and
   *    nothing downstream can then be trusted to know a request's shape.
   */
  validateFilledData(
    filledData: Record<string, unknown>,
  ): FilledDataViolation[] {
    const violations: FilledDataViolation[] = []
    for (const field of this.props.fields) {
      const reason = field.validate(filledData[field.fieldKey])
      if (reason !== null) violations.push({ fieldKey: field.fieldKey, reason })
    }
    const declared = new Set(this.props.fields.map((f) => f.fieldKey))
    for (const key of Object.keys(filledData)) {
      if (!declared.has(key))
        violations.push({
          fieldKey: key,
          reason: "This field is not part of this template.",
        })
    }
    return violations
  }

  /**
   * Validate only the keys present in a partial body.
   *
   * validateFilledData answers "is this form complete and correct?", which is
   * the right question at submission and the wrong one during extraction: the
   * form is still being filled, so every field nobody has answered yet would
   * be reported as missing and a valid write would be rejected. This answers
   * the narrower question -- "is what you sent me acceptable?" -- by checking
   * membership and type for the supplied keys and ignoring the rest.
   */
  validatePartial(
    partial: Record<string, unknown>,
  ): FilledDataViolation[] {
    const violations: FilledDataViolation[] = []
    const byKey = new Map(this.props.fields.map((f) => [f.fieldKey, f]))
    for (const [key, value] of Object.entries(partial)) {
      const field = byKey.get(key)
      if (!field) {
        violations.push({
          fieldKey: key,
          reason: "This field is not part of this template.",
        })
        continue
      }
      // An empty value here means "no answer", not "answered with nothing".
      if (value === null || value === undefined || value === "") continue
      const reason = field.validate(value)
      if (reason !== null) violations.push({ fieldKey: key, reason })
    }
    return violations
  }

  /**
   * Field keys only, for callers that do not need the reasons.
   * Prefer validateFilledData, which explains each failure.
   */
  validateSubmission(filledData: Record<string, unknown>): string[] {
    return this.validateFilledData(filledData).map((v) => v.fieldKey)
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

  /**
   * ABAC detail: snapshots of the eligibility rules the user's attributes fail
   * to satisfy (empty array = eligible). Same deny-by-default semantics as
   * isEligible; useful for explaining *why* a user is not eligible.
   */
  unmetEligibilityRules(
    userAttributes: Map<string, unknown>,
  ): ReturnType<TemplateEligibilityRule["snapshot"]>[] {
    return this.props.eligibilityRules
      .filter(
        (rule) =>
          !rule.isSatisfiedBy(userAttributes.get(rule.attributeId.toString())),
      )
      .map((rule) => rule.snapshot())
  }

  snapshot(): {
    code?: string
    classifierDocument?: string
    categoryId: string
    title: { ar: string; en?: string }
    description?: { ar: string; en?: string }
    sensitivityLevelId: string
    isActive: boolean
    fields: ReturnType<TemplateField["snapshot"]>[]
    eligibilityRules: ReturnType<TemplateEligibilityRule["snapshot"]>[]
  } {
    return {
      code: this.props.code,
      classifierDocument: this.props.classifierDocument,
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
