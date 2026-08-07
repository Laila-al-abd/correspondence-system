import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import { Identifier } from '../../../../domain/shared/identifier'
import { ROLE_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { GrantPermissionToRoleCommand } from './grant-permission-to-role.command'

/**
 * Adds one permission to a role. Idempotent -- the aggregate holds a set, so
 * granting twice is granting once.
 *
 * This is the runtime half of `role_permissions`: the seed fills it for built-in
 * roles, and a super admin fills it for the roles they compose.
 */
@CommandHandler(GrantPermissionToRoleCommand)
export class GrantPermissionToRoleHandler
  implements ICommandHandler<GrantPermissionToRoleCommand, void>
{
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
  ) {}

  async execute({ input }: GrantPermissionToRoleCommand): Promise<void> {
    const [unknown] = await this.roles.unknownPermissionCodes([
      input.permissionCode,
    ])
    if (unknown)
      throw new InvariantViolationError(`No such permission: ${unknown}.`)

    const role = await this.roles.findById(Identifier.of(input.roleId))
    if (!role) throw new EntityNotFoundError('Role', input.roleId)

    role.grant(input.permissionCode)
    await this.roles.save(role)
  }
}
