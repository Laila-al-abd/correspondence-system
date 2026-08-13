import { Identifier } from "../../shared/identifier";
import { AttributeDefinition } from "../attribute-definition";
export interface AttributeDefinitionRepository {
    findById(id: Identifier): Promise<AttributeDefinition | null>;
    findByCode(code: string): Promise<AttributeDefinition | null>;
    list(): Promise<AttributeDefinition[]>;
}
