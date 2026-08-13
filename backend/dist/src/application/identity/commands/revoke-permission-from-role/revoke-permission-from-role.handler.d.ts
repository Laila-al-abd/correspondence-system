import { ICommandHandler } from '@nestjs/cqrs';
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository';
import { AdministrativeFloorPolicy } from '../../policies/administrative-floor.policy';
import { RevokePermissionFromRoleCommand } from './revoke-permission-from-role.command';
export declare class RevokePermissionFromRoleHandler implements ICommandHandler<RevokePermissionFromRoleCommand, void> {
    private readonly roles;
    private readonly floor;
    constructor(roles: RoleRepository, floor: AdministrativeFloorPolicy);
    execute({ input }: RevokePermissionFromRoleCommand): Promise<void>;
}
