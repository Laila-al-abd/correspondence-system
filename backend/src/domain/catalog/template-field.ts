import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
import { Guard } from "../shared/guard"
import { InvariantViolationError } from "../shared/domain-error"
import { FieldDataType } from "./enums"
import { TemplateFieldOption } from "./template-field-option"

interface TemplateFieldProps {
  fieldKey: string
  label: LocalizedText
  dataType: FieldDataType
  isRequired: boolean
  ordinal: number
  /**
   * The Arabic question the extractive QA model is asked for this field. It is
   * a model input, fine-tuned on these exact strings, so it is stored verbatim
   * and is not display text.
   */
  extractionQuestion?: string
  /** Allowed choices — required for ENUM fields, empty for every other type. */
  options?: TemplateFieldOption[]
}

/** A single input a requester must fill in for a template. */
export class TemplateField extends Entity {
  private constructor(id: Identifier, private props: TemplateFieldProps) {
    super(id)
  }

  static create(id: Identifier, p: TemplateFieldProps): TemplateField {
    Guard.againstEmpty(p.fieldKey, "fieldKey")
    const options = p.options ?? []
    if (p.dataType === FieldDataType.ENUM) {
      if (options.length === 0)
        throw new InvariantViolationError(`ENUM field "${p.fieldKey}" must define at least one option.`)
      const values = options.map((o) => o.value)
      if (new Set(values).size !== values.length)
        throw new InvariantViolationError(`Duplicate option value in field "${p.fieldKey}".`)
    } else if (options.length > 0) {
      throw new InvariantViolationError(`Only ENUM fields may define options (field "${p.fieldKey}").`)
    }
    return new TemplateField(id, { ...p, options })
  }

  static rehydrate(id: Identifier, props: TemplateFieldProps): TemplateField {
    return new TemplateField(id, { ...props, options: props.options ?? [] })
  }

  get fieldKey(): string { return this.props.fieldKey }
  get isRequired(): boolean { return this.props.isRequired }
  get ordinal(): number { return this.props.ordinal }
  get options(): readonly TemplateFieldOption[] { return this.props.options ?? [] }
  get extractionQuestion(): string | undefined { return this.props.extractionQuestion }

  /**
   * Validates a submitted value against this field's declared type.
   * Returns null when the value is acceptable, or a human-readable reason.
   *
   * A reason rather than a boolean, because a requester who is told only that
   * their form is invalid cannot fix it. The reason travels all the way out to
   * the API response.
   */
  validate(value: unknown): string | null {
    const empty = value === null || value === undefined || value === ""
    if (empty) return this.props.isRequired ? "This field is required." : null
    switch (this.props.dataType) {
      case FieldDataType.NUMBER: {
        const numeric = Number(value)
        if (!Number.isFinite(numeric)) return "Expected a number."
        // Year fields are bounded. The extractor's numeric normaliser has no
        // range awareness -- it will turn a stray "15" in the sentence into
        // the number 15 -- and a deferment recorded for the year 15 is not the
        // kind of mistake anyone notices downstream. The bound is wide on
        // purpose: it rejects nonsense, not unusual-but-real values.
        if (this.props.fieldKey.endsWith("_year") && (numeric < 1900 || numeric > 2100))
          return "Expected a year between 1900 and 2100."
        return null
      }
      case FieldDataType.DATE:
        return isCalendarDate(String(value))
          ? null
          : "Expected a real calendar date written as YYYY-MM-DD."
      case FieldDataType.BOOLEAN:
        return isBooleanLike(value) ? null : "Expected true or false."
      case FieldDataType.ENUM: {
        const allowed = this.options.map((o) => o.value)
        return allowed.includes(String(value))
          ? null
          : `Expected one of: ${allowed.join(", ")}.`
      }
      case FieldDataType.TEXT:
        return String(value).length > 0 ? null : "Expected text."
      default:
        return null
    }
  }

  /** Boolean form of validate(), kept for callers that only need a yes or no. */
  accepts(value: unknown): boolean {
    return this.validate(value) === null
  }

  snapshot(): {
    id: string
    fieldKey: string
    label: { ar: string; en?: string }
    dataType: FieldDataType
    isRequired: boolean
    ordinal: number
    extractionQuestion?: string
    options: { value: string; label: { ar: string; en?: string }; ordinal: number }[]
  } {
    return {
      id: this.id.toString(),
      fieldKey: this.props.fieldKey,
      label: this.props.label.toJSON(),
      dataType: this.props.dataType,
      isRequired: this.props.isRequired,
      ordinal: this.props.ordinal,
      extractionQuestion: this.props.extractionQuestion,
      options: (this.props.options ?? []).map((o) => ({
        value: o.value,
        label: o.label.toJSON(),
        ordinal: o.ordinal,
      })),
    }
  }
}


/**
 * A strict calendar-date check.
 *
 * Date.parse is not usable here: in JavaScript `new Date("2026-02-31")` does not
 * fail, it rolls over to 3 March. A validator built on Date.parse therefore
 * accepts dates that do not exist, and the wrong date is stored silently. This
 * parses the parts and confirms the date survives the round trip unchanged.
 */
function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

/** Accepts real booleans and the two strings a JSON form is likely to send. */
function isBooleanLike(value: unknown): boolean {
  if (typeof value === "boolean") return true
  const text = String(value).toLowerCase()
  return text === "true" || text === "false"
}
