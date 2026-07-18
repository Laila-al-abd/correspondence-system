import { Repository } from "../../shared/repository"
import { Identifier } from "../../shared/identifier"
import { Role } from "../role"
export interface RoleRepository extends Repository<Role> {
// Effective permission codes for a user, aggregated across all their (scoped) roles.
effectivePermissions(userId: Identifier): Promise<Set<string>>
}