import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { UserRepository } from '../../../../domain/identity/ports/user.repository'
import { UserStatus } from '../../../../domain/identity/enums'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import { Identifier } from '../../../../domain/shared/identifier'
import { USER_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { AdministrativeFloorPolicy } from '../../policies/administrative-floor.policy'
import { UpdateUserStatusCommand } from './update-user-status.command'

export interface UpdateUserStatusResult {
  userId: string
  status: UserStatus
}

/**
 * Activates, suspends, or deactivates an account.
 *
 * The status column has existed since the first migration and every gate that
 * matters already reads it -- LocalAuthProvider refuses a login unless the
 * account is ACTIVE, and PrismaAssigneeDirectory.findCandidates filters routing
 * candidates on the same value -- but nothing could ever write it after
 * creation. So the column was honest about intent and useless in practice: a
 * departing employee kept a working password and kept receiving steps.
 *
 * SUSPENDED and INACTIVE are treated identically by every gate; the distinction
 * is administrative record-keeping (a temporary bar versus someone who has
 * left), which is why both are offered rather than a boolean.
 *
 * Two things this deliberately does NOT do.
 *
 * Steps already assigned to the person are left alone. Reassigning them here
 * would mean guessing, silently, at a routing decision the admin can make
 * explicitly on the assign-step screen; and ownership is re-resolved when a
 * step is released, so future work routes around the account on its own.
 *
 * It does not revoke roles. The account keeps its authority on paper so that
 * reactivating it restores the person to their desk, rather than requiring an
 * admin to remember what they held.
 *
 * The administrative floor is enforced on the way out of ACTIVE for exactly the
 * reason the policy exists: this route is guarded by user.manage, so the sole
 * administrator could otherwise suspend themselves and lock the installation
 * out of its own API. The policy comment names suspension as a caller.
 */
@CommandHandler(UpdateUserStatusCommand)
export class UpdateUserStatusHandler
  implements ICommandHandler<UpdateUserStatusCommand, UpdateUserStatusResult>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly floor: AdministrativeFloorPolicy,
  ) {}

  async execute({
    input,
  }: UpdateUserStatusCommand): Promise<UpdateUserStatusResult> {
    const userId = Identifier.of(input.userId)
    const user = await this.users.findById(userId)
    if (!user) throw new EntityNotFoundError('User', input.userId)

    const target = this.parse(input.status)
    if (user.status === target)
      return { userId: userId.toString(), status: target }

    // Only a transition out of ACTIVE can starve the system of administrators;
    // reactivating an account never can.
    if (target !== UserStatus.ACTIVE)
      await this.floor.assertNotLastHolder(userId)

    if (target === UserStatus.ACTIVE) user.activate()
    else if (target === UserStatus.SUSPENDED) user.suspend()
    else user.deactivate()

    await this.users.save(user)
    return { userId: userId.toString(), status: user.status }
  }

  private parse(value: string): UserStatus {
    const upper = value.trim().toUpperCase()
    if (upper === UserStatus.ACTIVE) return UserStatus.ACTIVE
    if (upper === UserStatus.SUSPENDED) return UserStatus.SUSPENDED
    if (upper === UserStatus.INACTIVE) return UserStatus.INACTIVE
    throw new InvariantViolationError(
      'status must be ACTIVE, SUSPENDED, or INACTIVE.',
    )
  }
}
