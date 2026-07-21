import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository'
import type { UserRepository } from '../../../../domain/identity/ports/user.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { EntityNotFoundError } from '../../../errors'
import { ROLE_REPOSITORY, USER_REPOSITORY } from '../../../tokens'
import { GetEffectivePermissionsQuery } from './get-effective-permissions.query'

/**
 * Resolves a user's effective permission codes through the RoleRepository. Used
 * by the /auth/me/permissions endpoint and mirrors what the PermissionsGuard
 * checks, so guard and query never drift apart.
 *
 * If the user id does not exist we throw EntityNotFoundError (-> 404) rather
 * than returning an empty list, so "unknown user" and "user with no roles" are
 * distinguishable to the caller.
 */
@QueryHandler(GetEffectivePermissionsQuery)
export class GetEffectivePermissionsHandler
  implements IQueryHandler<GetEffectivePermissionsQuery, string[]>
{
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  async execute(query: GetEffectivePermissionsQuery): Promise<string[]> {
    const userId = Identifier.of(query.userId)
    const user = await this.users.findById(userId)
    if (!user) throw new EntityNotFoundError('User', query.userId)

    const codes = await this.roles.effectivePermissions(userId)
    return [...codes].sort()
  }
}
