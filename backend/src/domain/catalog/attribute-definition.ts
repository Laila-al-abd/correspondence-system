import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
import { InvariantViolationError } from "../shared/domain-error"
import { AttributeDataType } from "./enums"
import { AttributeOption } from "./attribute-option"

interface AttributeDefinitionProps {
  code: string
  label: LocalizedText
  dataType: AttributeDataType
  description?: LocalizedText
  // Required (>=1) for ENUM, forbidden for every other type -- the same rule
  // TemplateField.assertOptionSet already enforces for template fields,
  // mirrored here rather than reinvented.
  options?: AttributeOption[]
}

/**
 * A named attribute in the ABAC vocabulary (e.g. "degree", "gpa", "isAlumnus").
 * Template eligibility rules reference these by id, and each user carries values
 * for them. The data type documents how a value is meant to be interpreted.
 */
export class AttributeDefinition extends Entity {
  private constructor(id: Identifier, private props: AttributeDefinitionProps) {
    super(id)
  }

  static create(id: Identifier, p: AttributeDefinitionProps): AttributeDefinition {
    return new AttributeDefinition(id, {
      ...p,
      options: assertOptionSet(p.code, p.dataType, p.options),
    })
  }

  static rehydrate(
    id: Identifier,
    props: AttributeDefinitionProps,
  ): AttributeDefinition {
    return new AttributeDefinition(id, { ...props, options: props.options ?? [] })
  }

  get code(): string { return this.props.code }
  get dataType(): AttributeDataType { return this.props.dataType }
  get options(): readonly AttributeOption[] { return this.props.options ?? [] }

  /**
   * Validates a value against this attribute's declared type -- the ABAC
   * counterpart of TemplateField.validate. This is the real membership check
   * that SetUserAttributeHandler.assertValueMatchesType's ENUM branch should
   * call instead of just checking `typeof value === 'string'` (which accepts
   * any string today, valid or not).
   */
  validate(value: unknown): string | null {
    if (this.props.dataType === AttributeDataType.ENUM) {
      const allowed = this.options.map((o) => o.value)
      return allowed.includes(String(value))
        ? null
        : `Expected one of: ${allowed.join(', ')}.`
    }
    return null
  }

  snapshot(): {
    id: string
    code: string
    label: { ar: string; en?: string }
    dataType: AttributeDataType
    description?: { ar: string; en?: string }
    options: { value: string; label: { ar: string; en?: string }; ordinal: number }[]
  } {
    return {
      id: this.id.toString(),
      code: this.props.code,
      label: this.props.label.toJSON(),
      dataType: this.props.dataType,
      description: this.props.description?.toJSON(),
      options: this.options.map((o) => ({
        value: o.value,
        label: o.label.toJSON(),
        ordinal: o.ordinal,
      })),
    }
  }
}

/** Mirrors TemplateField's assertOptionSet exactly -- same rule, same reasoning. */
function assertOptionSet(
  code: string,
  dataType: AttributeDataType,
  options?: AttributeOption[],
): AttributeOption[] {
  const set = options ?? []
  if (dataType === AttributeDataType.ENUM) {
    if (set.length === 0)
      throw new InvariantViolationError(
        `ENUM attribute "${code}" must define at least one option.`,
      )
    const values = set.map((o) => o.value)
    if (new Set(values).size !== values.length)
      throw new InvariantViolationError(
        `Duplicate option value in attribute "${code}".`,
      )
  } else if (set.length > 0) {
    throw new InvariantViolationError(
      `Only ENUM attributes may define options (attribute "${code}").`,
    )
  }
  return set
}