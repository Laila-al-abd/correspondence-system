// Exact counterpart of TemplateFieldOption for the ABAC vocabulary.
import { Entity } from '../shared/entity'
import { Identifier } from '../shared/identifier'
import { LocalizedText } from '../shared/localized-text'

interface AttributeOptionProps {
  value: string
  label: LocalizedText
  ordinal: number
}

export class AttributeOption extends Entity {
  private constructor(id: Identifier, private props: AttributeOptionProps) {
    super(id)
  }

  static create(id: Identifier, p: AttributeOptionProps): AttributeOption {
    return new AttributeOption(id, p)
  }
  static rehydrate(id: Identifier, props: AttributeOptionProps): AttributeOption {
    return new AttributeOption(id, props)
  }

  get value(): string { return this.props.value }
  get label(): LocalizedText { return this.props.label }
  get ordinal(): number { return this.props.ordinal }
}