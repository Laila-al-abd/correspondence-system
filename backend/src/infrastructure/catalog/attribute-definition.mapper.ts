import type { Prisma } from '../../../generated/prisma/client';
import { AttributeDefinition } from '../../domain/catalog/attribute-definition';
import { AttributeOption } from '../../domain/catalog/attribute-option';
import { AttributeDataType } from '../../domain/catalog/enums';
import { Identifier } from '../../domain/shared/identifier';
import { LocalizedText } from '../../domain/shared/localized-text';

type Bilingual = { ar: string; en?: string };

const toLocalized = (json: Prisma.JsonValue): LocalizedText => {
  const value = json as unknown as Bilingual;
  return LocalizedText.create(value.ar, value.en);
};

/**
 * The relation an AttributeDefinition must be loaded with to rebuild the whole
 * entity. Options MUST be included: an ENUM attribute whose options were not
 * loaded would reject every value (validate() checks membership against them).
 */
export const attributeInclude = {
  options: true,
} satisfies Prisma.AttributeDefinitionInclude;

type AttributeDefinitionRow = Prisma.AttributeDefinitionGetPayload<{
  include: typeof attributeInclude;
}>;

/** Maps the attribute_definitions row (plus options) to the domain entity. */
export const AttributeDefinitionMapper = {
  toDomain(row: AttributeDefinitionRow): AttributeDefinition {
    return AttributeDefinition.rehydrate(Identifier.of(row.id), {
      code: row.code,
      label: toLocalized(row.label),
      dataType: row.dataType as AttributeDataType,
      description: row.description ? toLocalized(row.description) : undefined,
      options: [...row.options]
        .sort((a, b) => a.ordinal - b.ordinal)
        .map((o) =>
          AttributeOption.rehydrate(Identifier.of(o.id), {
            value: o.value,
            label: toLocalized(o.label),
            ordinal: o.ordinal,
          }),
        ),
    });
  },
};
