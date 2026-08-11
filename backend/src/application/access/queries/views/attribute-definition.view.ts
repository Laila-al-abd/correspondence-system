import type { AttributeDefinition } from '../../../../domain/catalog/attribute-definition';
import type { AttributeDataType } from '../../../../domain/catalog/enums';

/** Read model for one ABAC attribute in the vocabulary. */
export interface AttributeDefinitionView {
  id: string;
  code: string;
  label: { ar: string; en?: string };
  dataType: AttributeDataType;
  description?: { ar: string; en?: string };
  /** Allowed choices — required (>=1) for ENUM attributes, empty for every other type. */
  options: {
    value: string;
    label: { ar: string; en?: string };
    ordinal: number;
  }[];
}

export function toAttributeDefinitionView(
  definition: AttributeDefinition,
): AttributeDefinitionView {
  return definition.snapshot();
}
