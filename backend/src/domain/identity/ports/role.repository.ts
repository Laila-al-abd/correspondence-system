import { Repository } from "../../shared/repository"
import { Identifier } from "../../shared/identifier"
import { Role } from "../role"
export interface RoleRepository extends Repository<Role> {
// Effective permission codes for a user, aggregated across all their (scoped) roles.
effectivePermissions(userId: Identifier): Promise<Set<string>>
// Does this role definition carry the permission code? Asked before authority
// is taken away, so the check must not depend on how a Role was hydrated.
roleCarries(roleId: Identifier, permissionCode: string): Promise<boolean>
// How many *active* users still hold this permission, optionally ignoring one
// of them. Used to refuse a change that would leave the system with nobody
// able to administer it. Counts distinct users, skips expired assignments,
// soft-deleted roles, soft-deleted users, and users who are not ACTIVE.
countHoldersOf(
permissionCode: string,
options?: { excludingUserId?: Identifier },
): Promise<number>
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