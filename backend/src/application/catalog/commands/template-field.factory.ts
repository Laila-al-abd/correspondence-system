import { TemplateField } from '../../../domain/catalog/template-field'
import { TemplateFieldOption } from '../../../domain/catalog/template-field-option'
import { FieldDataType } from '../../../domain/catalog/enums'
import { Identifier } from '../../../domain/shared/identifier'
import { LocalizedText } from '../../../domain/shared/localized-text'

/** One allowed choice of an ENUM field, as an authoring caller states it. */
export interface TemplateFieldOptionInput {
  value: string
  labelAr: string
  labelEn?: string
}

/**
 * A field definition as an authoring caller states it: bilingual text arrives
 * flattened (labelAr / labelEn) because that is what travels well over JSON,
 * and is folded into LocalizedText here rather than in the controller.
 */
export interface TemplateFieldInput {
  key: string
  labelAr: string
  labelEn?: string
  dataType: FieldDataType
  isRequired?: boolean
  extractionQuestion?: string
  options?: TemplateFieldOptionInput[]
}

/**
 * Turns an authoring input into the field's whole property set.
 *
 * Shared by creation and redefinition on purpose: the two paths must produce
 * identical shapes, or a field would mean something slightly different
 * depending on whether it arrived with its template or was added afterwards.
 *
 * Option ordinals are assigned from list position, so the order options are
 * written in is the order they are offered in.
 */
export function templateFieldProps(input: TemplateFieldInput, ordinal: number) {
  return {
    fieldKey: input.key,
    label: LocalizedText.create(input.labelAr, input.labelEn),
    dataType: input.dataType,
    isRequired: input.isRequired ?? false,
    ordinal,
    extractionQuestion: input.extractionQuestion,
    options: (input.options ?? []).map((option, index) =>
      TemplateFieldOption.create(
        option.value,
        LocalizedText.create(option.labelAr, option.labelEn),
        index + 1,
      ),
    ),
  }
}

export function buildTemplateField(
  id: Identifier,
  input: TemplateFieldInput,
  ordinal: number,
): TemplateField {
  return TemplateField.create(id, templateFieldProps(input, ordinal))
}
