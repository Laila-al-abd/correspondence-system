import { Repository } from "../../shared/repository";
import { Identifier } from "../../shared/identifier";
import { Role } from "../role";
export interface RoleRepository extends Repository<Role> {
    effectivePermissions(userId: Identifier): Promise<Set<string>>;
    roleCarries(roleId: Identifier, permissionCode: string): Promise<boolean>;
    countHoldersOf(permissionCode: string, options?: {
        excludingUserId?: Identifier;
        excludingRoleId?: Identifier;
    }): Promise<number>;
    unknownPermissionCodes(codes: string[]): Promise<string[]>;
    countAssignments(roleId: Identifier): Promise<number>;
    assignToUser(params: {
        userId: Identifier;
        roleId: Identifier;
        departmentId?: Identifier;
        reason?: string;
        expiresAt?: Date;
        assignedBy?: Identifier;
    }): Promise<void>;
    revokeFromUser(params: {
        userId: Identifier;
        roleId: Identifier;
        departmentId?: Identifier;
    }): Promise<void>;
}
