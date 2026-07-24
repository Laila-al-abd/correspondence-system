import { Identifier } from "../../shared/identifier"
import { UserAttribute } from "../user-attribute"

// Read port for a user's ABAC attribute values (user_attributes).
export interface UserAttributeRepository {
  listForUser(userId: Identifier): Promise<UserAttribute[]>
}
