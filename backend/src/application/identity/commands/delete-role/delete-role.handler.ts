import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import { Identifier } from '../../../../domain/shared/identifier'
import { ROLE_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { DeleteRoleCommand } from './delete-role.command'

/**
 * Retires a role. Soft, and only once nobody is assigned to it.
 *
 * Refusing while assignments exist does two things at once. It keeps the
 * `user_roles` history pointing at a role the admin screen still lists, and it
 * makes the administrative floor unreachable from here: a role nobody holds
 * cannot take a permission away from anybody, so retiring it can never be the
 * edit that leaves the system unadministrable. Revoke first, retire second.
 *
 * Built-in roles are refused outright by the aggregate.
 */
@CommandHandler(DeleteRoleCommand)
export class DeleteRoleHandler
  implements ICommandHandler<DeleteRoleCommand, void>
{
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
  ) {}

  async execute({ input }: DeleteRoleCommand): Promise<void> {
    const roleId = Identifier.of(input.roleId)
    const role = await this.roles.findById(roleId)
    if (!role) throw new EntityNotFoundError('Role', input.roleId)

    const assignments = await this.roles.countAssignments(roleId)
    if (assignments > 0)
      throw new InvariantViolationError(
        `This role is still assigned to ${assignments} account(s). Revoke those assignments before retiring it.`,
      )

    role.softDelete()
    await this.roles.save(role)
  }
}
