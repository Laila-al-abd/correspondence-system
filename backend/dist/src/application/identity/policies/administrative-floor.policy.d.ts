import type { RoleRepository } from '../../../domain/identity/ports/role.repository';
import { Identifier } from '../../../domain/shared/identifier';
export declare class AdministrativeFloorPolicy {
    private readonly roles;
    static readonly ADMINISTRATIVE_PERMISSION = "user.manage";
    constructor(roles: RoleRepository);
    assertRevocationAllowed(userId: Identifier, roleId: Identifier): Promise<void>;
    assertNotLastHolder(userId: Identifier): Promise<void>;
    assertRoleMayLosePermission(roleId: Identifier, permissionCode: string): Promise<void>;
}
