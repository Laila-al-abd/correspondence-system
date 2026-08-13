import { ICommandHandler } from '@nestjs/cqrs';
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository';
import { DeleteRoleCommand } from './delete-role.command';
export declare class DeleteRoleHandler implements ICommandHandler<DeleteRoleCommand, void> {
    private readonly roles;
    constructor(roles: RoleRepository);
    execute({ input }: DeleteRoleCommand): Promise<void>;
}
