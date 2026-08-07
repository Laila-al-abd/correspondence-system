import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { ROLE_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { AdministrativeFloorPolicy } from '../../policies/administrative-floor.policy'
import { RevokePermissionFromRoleCommand } from './revoke-permission-from-role.command'

/**
 * Takes one permission out of a role. Idempotent: removing a code the role does
 * not carry is a no-op rather than a 404, because the caller's intent -- "this
 * role must not grant that" -- is already satisfied.
 *
 * The floor policy runs first. Unlike revoking a role from a person, this edit
 * removes the permission from every holder at once, so it is the fastest way to
 * leave an installation with nobody able to administer it.
 */
@CommandHandler(RevokePermissionFromRoleCommand)
export class RevokePermissionFromRoleHandler
  implements ICommandHandler<RevokePermissionFromRoleCommand, void>
{
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    private readonly floor: AdministrativeFloorPolicy,
  ) {}

  async execute({ input }: RevokePermissionFromRoleCommand): Promise<void> {
    const roleId = Identifier.of(input.roleId)
    const role = await this.roles.findById(roleId)
    if (!role) throw new EntityNotFoundError('Role', input.roleId)

    await this.floor.assertRoleMayLosePermission(roleId, input.permissionCode)

    role.revoke(input.permissionCode)
    await this.roles.save(role)
  }
}
