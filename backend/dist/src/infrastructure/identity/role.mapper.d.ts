import { Role } from '../../domain/identity/role';
import { Prisma } from '../../../generated/prisma/client';
import type { Role as RoleRow } from '../../../generated/prisma/client';
export declare const RoleMapper: {
    toDomain(row: RoleRow, permissionCodes: string[]): Role;
    toPersistence(role: Role): Prisma.RoleUncheckedCreateInput;
};
