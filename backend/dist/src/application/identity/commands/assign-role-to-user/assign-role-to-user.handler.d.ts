import { ICommandHandler } from '@nestjs/cqrs';
import type { UserRepository } from '../../../../domain/identity/ports/user.repository';
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository';
import type { DepartmentRepository } from '../../../../domain/organization/ports/department.repository';
import { AssignRoleToUserCommand } from './assign-role-to-user.command';
export interface AssignRoleToUserResult {
    userId: string;
    roleId: string;
    departmentId?: string;
}
export declare class AssignRoleToUserHandler implements ICommandHandler<AssignRoleToUserCommand, AssignRoleToUserResult> {
    private readonly users;
    private readonly roles;
    private readonly departments;
    constructor(users: UserRepository, roles: RoleRepository, departments: DepartmentRepository);
    execute({ input, }: AssignRoleToUserCommand): Promise<AssignRoleToUserResult>;
}
