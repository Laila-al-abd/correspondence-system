import { IQueryHandler } from '@nestjs/cqrs';
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository';
import type { UserRepository } from '../../../../domain/identity/ports/user.repository';
import { GetEffectivePermissionsQuery } from './get-effective-permissions.query';
export declare class GetEffectivePermissionsHandler implements IQueryHandler<GetEffectivePermissionsQuery, string[]> {
    private readonly roles;
    private readonly users;
    constructor(roles: RoleRepository, users: UserRepository);
    execute(query: GetEffectivePermissionsQuery): Promise<string[]>;
}
