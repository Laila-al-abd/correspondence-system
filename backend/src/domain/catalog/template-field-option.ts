import { ValueObject } from "../shared/value-object"
import { Guard } from "../shared/guard"
import { LocalizedText } from "../shared/localized-text"

/**
 * One allowed choice for an ENUM template field. `value` is the stored code
 * (what ends up in the request's filled_data); `label` is the bilingual text
 * shown to users. Options are part of the field *definition*, not request data.
 */
export class TemplateFieldOption extends ValueObject<{
  value: string
  label: LocalizedText
  ordinal: number
}> {
  private constructor(props: { value: string; label: LocalizedText; ordinal: number }) {
    super(props)
  }

  static create(value: string, label: LocalizedText, ordinal = 0): TemplateFieldOption {
    return new TemplateFieldOption({
      value: Guard.againstEmpty(value, "option value"),
      label,
      ordinal,
    })
  }

  get value(): string { return this.props.value }
  get label(): LocalizedText { return this.props.label }
  get ordinal(): number { return this.props.ordinal }
}
