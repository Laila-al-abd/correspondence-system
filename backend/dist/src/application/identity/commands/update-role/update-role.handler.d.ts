import { ICommandHandler } from '@nestjs/cqrs';
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository';
import { UpdateRoleCommand } from './update-role.command';
export declare class UpdateRoleHandler implements ICommandHandler<UpdateRoleCommand, void> {
    private readonly roles;
    constructor(roles: RoleRepository);
    execute({ input }: UpdateRoleCommand): Promise<void>;
}
