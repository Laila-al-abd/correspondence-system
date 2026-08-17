import { Identifier } from "../../shared/identifier"
import { AttributeDefinition } from "../attribute-definition"

// Port for the ABAC attribute vocabulary (attribute_definitions). A plain
// lookup entity, so it gets a focused interface rather than the aggregate
// Repository base.
export interface AttributeDefinitionRepository {
  findById(id: Identifier): Promise<AttributeDefinition | null>
  findByCode(code: string): Promise<AttributeDefinition | null>
  list(): Promise<AttributeDefinition[]>
  /**
   * Persists the definition together with its option set, replacing any options
   * previously stored for it. The vocabulary used to be seed-only, which made
   * every new attribute a database task; the eligibility engine reads it at
   * request time, so it belongs behind the same port as the reads that use it.
   */
  save(definition: AttributeDefinition): Promise<void>
}
