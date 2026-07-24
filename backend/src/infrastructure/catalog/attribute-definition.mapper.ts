import type {
  AttributeDefinition as AttributeDefinitionRow,
  Prisma,
} from '../../../generated/prisma/client'
import { AttributeDefinition } from '../../domain/catalog/attribute-definition'
import { AttributeDataType } from '../../domain/catalog/enums'
import { Identifier } from '../../domain/shared/identifier'
import { LocalizedText } from '../../domain/shared/localized-text'

type Bilingual = { ar: string; en?: string }

const toLocalized = (json: Prisma.JsonValue): LocalizedText => {
  const value = json as unknown as Bilingual
  return LocalizedText.create(value.ar, value.en)
}

/** Maps the attribute_definitions row to the AttributeDefinition entity. */
export const AttributeDefinitionMapper = {
  toDomain(row: AttributeDefinitionRow): AttributeDefinition {
    return AttributeDefinition.rehydrate(Identifier.of(row.id), {
      code: row.code,
      label: toLocalized(row.label),
      dataType: row.dataType as AttributeDataType,
      description: row.description ? toLocalized(row.description) : undefined,
    })
  },
}
