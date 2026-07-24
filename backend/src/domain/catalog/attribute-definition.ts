import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
import { AttributeDataType } from "./enums"

interface AttributeDefinitionProps {
  code: string
  label: LocalizedText
  dataType: AttributeDataType
  description?: LocalizedText
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
    return new AttributeDefinition(id, p)
  }

  static rehydrate(
    id: Identifier,
    props: AttributeDefinitionProps,
  ): AttributeDefinition {
    return new AttributeDefinition(id, props)
  }

  get code(): string { return this.props.code }
  get dataType(): AttributeDataType { return this.props.dataType }

  snapshot(): {
    id: string
    code: string
    label: { ar: string; en?: string }
    dataType: AttributeDataType
    description?: { ar: string; en?: string }
  } {
    return {
      id: this.id.toString(),
      code: this.props.code,
      label: this.props.label.toJSON(),
      dataType: this.props.dataType,
      description: this.props.description?.toJSON(),
    }
  }
}
