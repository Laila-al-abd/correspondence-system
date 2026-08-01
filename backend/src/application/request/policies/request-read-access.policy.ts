import { Inject, Injectable } from '@nestjs/common'
import type { RoleRepository } from '../../../domain/identity/ports/role.repository'
import { Identifier } from '../../../domain/shared/identifier'
import { ROLE_REPOSITORY } from '../../tokens'
import { ForbiddenActionError } from '../../errors'

/**
 * Who may look at a request: the person who filed it, or a member of staff who
 * holds `request.read`.
 *
 * This exists as a policy rather than as a route decorator because the two
 * halves cannot both be expressed declaratively. `@RequirePermissions` covers
 * the staff half, but an applicant holds no permissions at all -- so a route
 * guarded that way locks people out of their own paperwork, which is the one
 * thing this system exists to prevent.
 *
 * The consequence, stated plainly because it is a real trade-off: routes using
 * this policy declare no permission, so WorkingHoursGuard's network allow-list
 * (which keys off declared permissions) does not cover them. That is accepted.
 * An applicant reading their own request from home is the normal case, and
 * reading was never time-boxed in this design either way -- `request.read` is
 * deliberately absent from TIME_RESTRICTED_PERMISSIONS.
 *
 * Kept in one place so the request detail view and the document download link
 * can never drift apart on who is allowed to see what.
 */
@Injectable()
export class RequestReadAccessPolicy {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
  ) {}

  async assertMayRead(callerId: string, requesterId: string): Promise<void> {
    if (callerId === requesterId) return

    const permissions = await this.roles.effectivePermissions(
      Identifier.of(callerId),
    )
    if (!permissions.has('request.read'))
      throw new ForbiddenActionError(
        'You may only view your own requests.',
      )
  }
}
