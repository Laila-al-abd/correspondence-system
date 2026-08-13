import { ICommandHandler } from '@nestjs/cqrs';
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import { CreateRoleCommand } from './create-role.command';
export interface CreateRoleResult {
    roleId: string;
}
export declare class CreateRoleHandler implements ICommandHandler<CreateRoleCommand, CreateRoleResult> {
    private readonly roles;
    private readonly ids;
    constructor(roles: RoleRepository, ids: IdGenerator);
    execute({ input }: CreateRoleCommand): Promise<CreateRoleResult>;
}
