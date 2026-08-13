import type { Prisma } from '../../../generated/prisma/client';
import { AttributeDefinition } from '../../domain/catalog/attribute-definition';
export declare const attributeInclude: {
    options: true;
};
type AttributeDefinitionRow = Prisma.AttributeDefinitionGetPayload<{
    include: typeof attributeInclude;
}>;
export declare const AttributeDefinitionMapper: {
    toDomain(row: AttributeDefinitionRow): AttributeDefinition;
};
export {};
