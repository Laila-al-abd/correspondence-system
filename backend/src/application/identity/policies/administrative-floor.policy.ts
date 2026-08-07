import { Inject, Injectable } from '@nestjs/common'
import type { RoleRepository } from '../../../domain/identity/ports/role.repository'
import { InvariantViolationError } from '../../../domain/shared/domain-error'
import { Identifier } from '../../../domain/shared/identifier'
import { ROLE_REPOSITORY } from '../../tokens'

/**
 * The floor beneath administrative authority.
 *
 * `user.manage` gates every route that can hand out or take away authority:
 * assigning roles, provisioning users, setting the attributes that eligibility
 * rules read. If the last account holding it loses it, the system becomes
 * permanently unadministrable through its own API, because granting the
 * permission back requires the permission. Recovery means re-running the seed
 * or editing the database by hand.
 *
 * Nothing in the permission model prevents this on its own. There is no
 * superuser tier standing above the roles — authority is a flat set of codes,
 * and "Administrator" is simply the role that happens to hold all of them.
 * That flatness is deliberate and worth keeping, so the protection has to be an
 * explicit invariant rather than a privileged account.
 *
 * It lives in one place on purpose. Revoking an assignment is only the first
 * way authority can be lost; deleting a user, suspending a user, and
 * soft-deleting a role would each do the same thing, and a rule copied into
 * four handlers is a rule that will eventually hold in three of them.
 *
 * The floor is one holder, not two. Requiring a spare administrator would be a
 * staffing policy, and the system has no standing to impose one on a faculty
 * that may genuinely have a single administrator.
 */
@Injectable()
export class AdministrativeFloorPolicy {
  /** The permission whose disappearance would lock everyone out. */
  static readonly ADMINISTRATIVE_PERMISSION = 'user.manage'

  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
  ) {}

  /**
   * Refuses a role revocation that would leave nobody able to administer the
   * system.
   *
   * Only roles that actually carry `user.manage` are interesting, so an
   * ordinary Reviewer revocation costs one indexed lookup and nothing more.
   *
   * When the role does carry it, the check is deliberately conservative: it
   * asks whether any *other* active user still holds the permission, rather
   * than trying to work out whether this user would keep it through some second
   * role. The conservative answer can refuse a revocation that would in fact
   * have been safe — the sole administrator stripping one of two
   * administrative roles from themselves — which is a rare and recoverable
   * annoyance. Being wrong in the other direction is not recoverable.
   */
  async assertRevocationAllowed(
    userId: Identifier,
    roleId: Identifier,
  ): Promise<void> {
    const carriesAuthority = await this.roles.roleCarries(
      roleId,
      AdministrativeFloorPolicy.ADMINISTRATIVE_PERMISSION,
    )
    if (!carriesAuthority) return

    await this.assertNotLastHolder(userId)
  }

  /**
   * The shared half of the rule: this user is about to lose `user.manage`, for
   * whatever reason. Any future path that removes authority — deleting a user,
   * suspending one, soft-deleting a role — should call this rather than
   * restating the condition.
   */
  async assertNotLastHolder(userId: Identifier): Promise<void> {
    const othersRemaining = await this.roles.countHoldersOf(
      AdministrativeFloorPolicy.ADMINISTRATIVE_PERMISSION,
      { excludingUserId: userId },
    )
    if (othersRemaining === 0)
      throw new InvariantViolationError(
        'This is the last account that can manage users. Grant an administrative role to another active account before removing it from this one.',
      )
  }

  /**
   * The other direction: authority lost not by taking a role away from a
   * person, but by taking the permission out of the role.
   *
   * This is the most dangerous of the paths and the least obviously so from an
   * admin screen -- one edit to one role removes the permission from every
   * holder at once, and the screen shows a checkbox rather than a list of
   * people. So the question asked is whether anybody would still hold
   * `user.manage` through some *other* live role once this one stops carrying
   * it.
   *
   * Built-in roles are refused earlier, by the aggregate, so in practice this
   * guards custom roles a super admin has composed. It is written for the case
   * where they composed the only one that carries authority.
   */
  async assertRoleMayLosePermission(
    roleId: Identifier,
    permissionCode: string,
  ): Promise<void> {
    if (permissionCode !== AdministrativeFloorPolicy.ADMINISTRATIVE_PERMISSION)
      return

    const carriesAuthority = await this.roles.roleCarries(
      roleId,
      permissionCode,
    )
    if (!carriesAuthority) return

    const elsewhere = await this.roles.countHoldersOf(permissionCode, {
      excludingRoleId: roleId,
    })
    if (elsewhere === 0)
      throw new InvariantViolationError(
        'This is the only role that can manage users. Give another role that permission, and give that role to an active account, before taking it away here.',
      )
  }
}
