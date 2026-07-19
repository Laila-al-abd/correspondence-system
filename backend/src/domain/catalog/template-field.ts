import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
import { Guard } from "../shared/guard"
import { FieldDataType } from "./enums"

interface TemplateFieldProps {
  fieldKey: string
  label: LocalizedText
  dataType: FieldDataType
  isRequired: boolean
  ordinal: number
}

/** A single input a requester must fill in for a template. */
export class TemplateField extends Entity {
  private constructor(id: Identifier, private props: TemplateFieldProps) {
    super(id)
  }

  static create(id: Identifier, p: TemplateFieldProps): TemplateField {
    Guard.againstEmpty(p.fieldKey, "fieldKey")
    return new TemplateField(id, p)
  }

  static rehydrate(id: Identifier, props: TemplateFieldProps): TemplateField {
    return new TemplateField(id, props)
  }

  get fieldKey(): string { return this.props.fieldKey }
  get isRequired(): boolean { return this.props.isRequired }
  get ordinal(): number { return this.props.ordinal }

  /** Validates a submitted value against this field's declared type. */
  accepts(value: unknown): boolean {
    const empty = value === null || value === undefined || value === ""
    if (empty) return !this.props.isRequired
    switch (this.props.dataType) {
      case FieldDataType.NUMBER: return !Number.isNaN(Number(value))
      case FieldDataType.DATE: return !Number.isNaN(Date.parse(String(value)))
      case FieldDataType.TEXT:
      case FieldDataType.ENUM: return String(value).length > 0
      default: return true
    }
  }
}
