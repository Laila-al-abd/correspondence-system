import { Identifier } from "../../shared/identifier"
import { AttributeDefinition } from "../attribute-definition"

// Read port for the ABAC attribute vocabulary (attribute_definitions). A plain
// lookup entity, so it gets a focused read interface rather than the aggregate
// Repository base.
export interface AttributeDefinitionRepository {
  findById(id: Identifier): Promise<AttributeDefinition | null>
  findByCode(code: string): Promise<AttributeDefinition | null>
  list(): Promise<AttributeDefinition[]>
}
