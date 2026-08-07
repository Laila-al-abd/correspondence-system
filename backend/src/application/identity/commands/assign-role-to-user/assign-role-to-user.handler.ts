import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { UserRepository } from '../../../../domain/identity/ports/user.repository'
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository'
import type { DepartmentRepository } from '../../../../domain/organization/ports/department.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import {
  DEPARTMENT_REPOSITORY,
  ROLE_REPOSITORY,
  USER_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { AssignRoleToUserCommand } from './assign-role-to-user.command'

export interface AssignRoleToUserResult {
  userId: string
  roleId: string
  departmentId?: string
}

/**
 * Grants a role to a user, optionally scoped to a department. Validates that the
 * user, role, and (when supplied) department exist, then delegates the join-row
 * write to the repository. The caller is recorded as the assigner.
 */
@CommandHandler(AssignRoleToUserCommand)
export class AssignRoleToUserHandler
  implements ICommandHandler<AssignRoleToUserCommand, AssignRoleToUserResult>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departments: DepartmentRepository,
  ) {}

  async execute({
    input,
  }: AssignRoleToUserCommand): Promise<AssignRoleToUserResult> {
    const userId = Identifier.of(input.userId)
    if (!(await this.users.findById(userId)))
      throw new EntityNotFoundError('User', input.userId)

    const roleId = Identifier.of(input.roleId)
    if (!(await this.roles.findById(roleId)))
      throw new EntityNotFoundError('Role', input.roleId)

    let departmentId: Identifier | undefined
    if (input.departmentId) {
      departmentId = Identifier.of(input.departmentId)
      if (!(await this.departments.findById(departmentId)))
        throw new EntityNotFoundError('Department', input.departmentId)
    }

    await this.roles.assignToUser({
      userId,
      roleId,
      departmentId,
      reason: input.reason,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      assignedBy: input.assignedBy
        ? Identifier.of(input.assignedBy)
        : undefined,
    })

    return {
      userId: input.userId,
      roleId: input.roleId,
      departmentId: input.departmentId,
    }
  }
}
