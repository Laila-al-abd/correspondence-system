import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import { Role } from '../../../../domain/identity/role'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import { LocalizedText } from '../../../../domain/shared/localized-text'
import { ID_GENERATOR, ROLE_REPOSITORY } from '../../../tokens'
import { CreateRoleCommand } from './create-role.command'

export interface CreateRoleResult {
  roleId: string
}

/**
 * Creates a role a super admin has composed, with the permissions it grants.
 *
 * Permissions themselves are a fixed, developer-owned list -- this endpoint
 * cannot invent one, only combine what exists, which is why unknown codes are
 * refused rather than ignored. The new role is never a system role: `is_system`
 * marks what the seed owns, and nothing created through the API is.
 */
@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler
  implements ICommandHandler<CreateRoleCommand, CreateRoleResult>
{
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async execute({ input }: CreateRoleCommand): Promise<CreateRoleResult> {
    const codes = [...new Set(input.permissionCodes ?? [])]
    const unknown = await this.roles.unknownPermissionCodes(codes)
    if (unknown.length > 0)
      throw new InvariantViolationError(
        `No such permission(s): ${unknown.join(', ')}.`,
      )

    const role = Role.create(
      this.ids.next(),
      LocalizedText.create(input.name.ar, input.name.en),
      input.description
        ? LocalizedText.create(input.description.ar, input.description.en)
        : undefined,
    )
    for (const code of codes) role.grant(code)

    await this.roles.save(role)
    return { roleId: role.id.toString() }
  }
}
