import { Prisma } from '../../../generated/prisma/client'
import { Template } from '../../domain/catalog/template'
import { TemplateField } from '../../domain/catalog/template-field'
import { TemplateFieldOption } from '../../domain/catalog/template-field-option'
import { TemplateEligibilityRule } from '../../domain/catalog/template-eligibility-rule'
import { FieldDataType, RuleOperator } from '../../domain/catalog/enums'
import { Identifier } from '../../domain/shared/identifier'
import { LocalizedText } from '../../domain/shared/localized-text'

/**
 * The relations a Template must be loaded with, to rebuild the whole aggregate.
 * Fields MUST include their options: an ENUM field whose options were not loaded
 * would reject every submitted value.
 */
export const templateInclude = {
  fields: { include: { options: true } },
  eligibilityRules: true,
} satisfies Prisma.TemplateInclude

type TemplateRow = Prisma.TemplateGetPayload<{ include: typeof templateInclude }>

type Bilingual = { ar: string; en?: string }

const toLocalized = (json: Prisma.JsonValue): LocalizedText => {
  const value = json as unknown as Bilingual
  return LocalizedText.create(value.ar, value.en)
}

/**
 * Maps between the Template aggregate (root + fields + options + eligibility
 * rules) and its Prisma rows.
 */
export const TemplateMapper = {
  toDomain(row: TemplateRow): Template {
    const fields = [...row.fields]
      .sort((a, b) => a.ordinal - b.ordinal)
      .map((f) =>
        TemplateField.rehydrate(Identifier.of(f.id), {
          fieldKey: f.fieldKey,
          label: toLocalized(f.label),
          dataType: f.dataType as FieldDataType,
          isRequired: f.isRequired,
          ordinal: f.ordinal,
          options: [...f.options]
            .sort((a, b) => a.ordinal - b.ordinal)
            .map((o) =>
              TemplateFieldOption.create(o.value, toLocalized(o.label), o.ordinal),
            ),
        }),
      )

    const eligibilityRules = row.eligibilityRules.map((r) =>
      TemplateEligibilityRule.rehydrate(Identifier.of(r.id), {
        attributeId: Identifier.of(r.attributeId),
        operator: r.operator as RuleOperator,
        value: r.value,
      }),
    )

    return Template.rehydrate(Identifier.of(row.id), {
      categoryId: Identifier.of(row.categoryId),
      title: toLocalized(row.title),
      description: row.description ? toLocalized(row.description) : undefined,
      sensitivityLevelId: Identifier.of(row.sensitivityLevelId),
      isActive: row.isActive,
      fields,
      eligibilityRules,
    })
  },

  /** Scalar columns of the template root row (children are written separately). */
  toRoot(template: Template): Prisma.TemplateUncheckedCreateInput {
    const s = template.snapshot()
    return {
      id: BigInt(template.id.toString()),
      categoryId: BigInt(s.categoryId),
      title: s.title as Prisma.InputJsonValue,
      description: s.description
        ? (s.description as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      sensitivityLevelId: BigInt(s.sensitivityLevelId),
      isActive: s.isActive,
    }
  },
}
