import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { ROLE_REPOSITORY } from '../../../tokens'
import { RevokeRoleFromUserCommand } from './revoke-role-from-user.command'

/**
 * Removes a role assignment from a user. When a department is supplied only that
 * scoped assignment is removed; otherwise the unscoped (global) assignment is.
 * Idempotent: removing an assignment that does not exist is a no-op.
 */
@CommandHandler(RevokeRoleFromUserCommand)
export class RevokeRoleFromUserHandler
  implements ICommandHandler<RevokeRoleFromUserCommand, void>
{
  constructor(@Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository) {}

  async execute({ input }: RevokeRoleFromUserCommand): Promise<void> {
    await this.roles.revokeFromUser({
      userId: Identifier.of(input.userId),
      roleId: Identifier.of(input.roleId),
      departmentId: input.departmentId
        ? Identifier.of(input.departmentId)
        : undefined,
    })
  }
}
