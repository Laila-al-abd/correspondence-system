import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { ROLE_REPOSITORY } from '../../../tokens'
import { AdministrativeFloorPolicy } from '../../policies/administrative-floor.policy'
import { RevokeRoleFromUserCommand } from './revoke-role-from-user.command'

/**
 * Removes a role assignment from a user. When a department is supplied only that
 * scoped assignment is removed; otherwise the unscoped (global) assignment is.
 * Idempotent: removing an assignment that does not exist is a no-op.
 *
 * The one thing it is not allowed to do is empty the system of administrators.
 * This endpoint is itself guarded by `user.manage`, so the caller is by
 * definition somebody who could revoke that permission from themselves in a
 * single request and lock the entire installation out of its own API. The floor
 * policy is what stands between an ordinary mistake and a database repair.
 */
@CommandHandler(RevokeRoleFromUserCommand)
export class RevokeRoleFromUserHandler
  implements ICommandHandler<RevokeRoleFromUserCommand, void>
{
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    private readonly floor: AdministrativeFloorPolicy,
  ) {}

  async execute({ input }: RevokeRoleFromUserCommand): Promise<void> {
    const userId = Identifier.of(input.userId)
    const roleId = Identifier.of(input.roleId)

    await this.floor.assertRevocationAllowed(userId, roleId)

    await this.roles.revokeFromUser({
      userId,
      roleId,
      departmentId: input.departmentId
        ? Identifier.of(input.departmentId)
        : undefined,
    })
  }
}
