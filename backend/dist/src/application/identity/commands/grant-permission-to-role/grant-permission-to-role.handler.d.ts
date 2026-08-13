import { ICommandHandler } from '@nestjs/cqrs';
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository';
import { GrantPermissionToRoleCommand } from './grant-permission-to-role.command';
export declare class GrantPermissionToRoleHandler implements ICommandHandler<GrantPermissionToRoleCommand, void> {
    private readonly roles;
    constructor(roles: RoleRepository);
    execute({ input }: GrantPermissionToRoleCommand): Promise<void>;
}
