import { AttributeDefinitionRepository } from '../../domain/catalog/ports/attribute-definition.repository';
import { AttributeDefinition } from '../../domain/catalog/attribute-definition';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaAttributeDefinitionRepository implements AttributeDefinitionRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: Identifier): Promise<AttributeDefinition | null>;
    findByCode(code: string): Promise<AttributeDefinition | null>;
    list(): Promise<AttributeDefinition[]>;
    save(definition: AttributeDefinition): Promise<void>;
}
