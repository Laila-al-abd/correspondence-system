import { Identifier } from "../../shared/identifier"
import { UserAttribute } from "../user-attribute"

// Read/write port for a user's ABAC attribute values (user_attributes).
export interface UserAttributeRepository {
  listForUser(userId: Identifier): Promise<UserAttribute[]>
  // Creates or overwrites a user's value for one attribute (upsert on user + attribute).
  setValue(params: {
    userId: Identifier
    attributeId: Identifier
    value: unknown
  }): Promise<void>
  // Removes a user's value for one attribute; a no-op when absent.
  clear(params: { userId: Identifier; attributeId: Identifier }): Promise<void>
}
