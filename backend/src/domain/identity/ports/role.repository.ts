import { Repository } from "../../shared/repository"
import { Identifier } from "../../shared/identifier"
import { Role } from "../role"
export interface RoleRepository extends Repository<Role> {
// Effective permission codes for a user, aggregated across all their (scoped) roles.
effectivePermissions(userId: Identifier): Promise<Set<string>>
// Grants a role to a user, optionally scoped to a department. Re-adds cleanly if present.
assignToUser(params: {
userId: Identifier
roleId: Identifier
departmentId?: Identifier
expiresAt?: Date
assignedBy?: Identifier
}): Promise<void>
// Removes a role assignment (the scoped one when a department is given, else the global one).
revokeFromUser(params: {
userId: Identifier
roleId: Identifier
departmentId?: Identifier
}): Promise<void>
}