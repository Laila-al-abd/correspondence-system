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

  /** Validates a submitted value against this field's declared type. */
  accepts(value: unknown): boolean {
    const empty = value === null || value === undefined || value === ""
    if (empty) return !this.props.isRequired
    switch (this.props.dataType) {
      case FieldDataType.NUMBER: return !Number.isNaN(Number(value))
      case FieldDataType.DATE: return !Number.isNaN(Date.parse(String(value)))
      case FieldDataType.ENUM: return this.options.some((o) => o.value === String(value))
      case FieldDataType.TEXT: return String(value).length > 0
      default: return true
    }
  }

  snapshot(): {
    id: string
    fieldKey: string
    label: { ar: string; en?: string }
    dataType: FieldDataType
    isRequired: boolean
    ordinal: number
    options: { value: string; label: { ar: string; en?: string }; ordinal: number }[]
  } {
    return {
      id: this.id.toString(),
      fieldKey: this.props.fieldKey,
      label: this.props.label.toJSON(),
      dataType: this.props.dataType,
      isRequired: this.props.isRequired,
      ordinal: this.props.ordinal,
      options: (this.props.options ?? []).map((o) => ({
        value: o.value,
        label: o.label.toJSON(),
        ordinal: o.ordinal,
      })),
    }
  }
}
