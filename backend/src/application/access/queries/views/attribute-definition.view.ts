import type { AttributeDefinition } from '../../../../domain/catalog/attribute-definition'
import type { AttributeDataType } from '../../../../domain/catalog/enums'

/** Read model for one ABAC attribute in the vocabulary. */
export interface AttributeDefinitionView {
  id: string
  code: string
  label: { ar: string; en?: string }
  dataType: AttributeDataType
  description?: { ar: string; en?: string }
}

export function toAttributeDefinitionView(
  definition: AttributeDefinition,
): AttributeDefinitionView {
  return definition.snapshot()
}
