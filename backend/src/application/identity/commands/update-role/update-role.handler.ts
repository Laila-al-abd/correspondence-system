import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { LocalizedText } from '../../../../domain/shared/localized-text'
import { ROLE_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { UpdateRoleCommand } from './update-role.command'

/**
 * Renames a role and rewrites its description. What a role *grants* is changed
 * through the permission endpoints instead: the two are edited on different
 * screens and one of them can lock an installation out of its own API, so they
 * are separate commands rather than one PUT that quietly does both.
 *
 * Built-in roles refuse the edit -- see Role.assertMutable.
 */
@CommandHandler(UpdateRoleCommand)
export class UpdateRoleHandler
  implements ICommandHandler<UpdateRoleCommand, void>
{
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
  ) {}

  async execute({ input }: UpdateRoleCommand): Promise<void> {
    const role = await this.roles.findById(Identifier.of(input.roleId))
    if (!role) throw new EntityNotFoundError('Role', input.roleId)

    role.rename(
      LocalizedText.create(input.name.ar, input.name.en),
      input.description
        ? LocalizedText.create(input.description.ar, input.description.en)
        : undefined,
    )
    await this.roles.save(role)
  }
}
