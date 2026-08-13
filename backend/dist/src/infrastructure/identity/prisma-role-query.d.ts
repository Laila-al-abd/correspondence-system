import type { PermissionGroupView, RoleDetailView, RoleQueryPort, RoleSummaryView } from '../../application/identity/ports/role-query.port';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaRoleQuery implements RoleQueryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listRoles(): Promise<RoleSummaryView[]>;
    getRole(id: string): Promise<RoleDetailView | null>;
    listPermissionGroups(): Promise<PermissionGroupView[]>;
}
