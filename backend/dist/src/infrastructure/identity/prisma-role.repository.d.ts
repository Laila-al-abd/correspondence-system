import { Role } from '../../domain/identity/role';
import { RoleRepository } from '../../domain/identity/ports/role.repository';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaRoleRepository implements RoleRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: Identifier): Promise<Role | null>;
    save(role: Role): Promise<void>;
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
