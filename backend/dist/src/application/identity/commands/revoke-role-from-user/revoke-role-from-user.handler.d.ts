import { ICommandHandler } from '@nestjs/cqrs';
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository';
import { AdministrativeFloorPolicy } from '../../policies/administrative-floor.policy';
import { RevokeRoleFromUserCommand } from './revoke-role-from-user.command';
export declare class RevokeRoleFromUserHandler implements ICommandHandler<RevokeRoleFromUserCommand, void> {
    private readonly roles;
    private readonly floor;
    constructor(roles: RoleRepository, floor: AdministrativeFloorPolicy);
    execute({ input }: RevokeRoleFromUserCommand): Promise<void>;
}
