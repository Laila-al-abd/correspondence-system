import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { UserRepository } from '../../../../domain/identity/ports/user.repository'
import type { DelegationRepository } from '../../../../domain/identity/ports/delegation.repository'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import type {
  DelegationQueryPort,
  DelegationView,
} from '../../ports/delegation-query.port'
import { Delegation } from '../../../../domain/identity/delegation'
import { Identifier } from '../../../../domain/shared/identifier'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import {
  DELEGATION_QUERY,
  DELEGATION_REPOSITORY,
  ID_GENERATOR,
  USER_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { NotificationEmitter } from '../../../observability/services/notification-emitter'
import { GrantDelegationCommand } from './grant-delegation.command'

/**
 * Grants a delegation: user A (delegator) authorizes user B (delegate) to act on
 * their behalf for a date window. Validates both users exist, then lets the
 * Delegation aggregate enforce its rules (no self-delegation; end not before
 * start). Returns the created delegation with names resolved.
 *
 * On top of those, one rule the aggregate cannot see because it needs the other
 * delegations in the system: authority may be handed over once, never relayed.
 * A may authorize B, but B may not then authorize C. Chains are refused for two
 * reasons. Accountability is the first: a signature two hops from its source is
 * one nobody can meaningfully answer for, and the point of recording an action
 * against a person is that the person can be asked about it. The second is that
 * chains have no natural end — without a depth limit a cycle is possible, and
 * resolving authority becomes a graph walk on a request path that already has a
 * permission check and a working-hours check in front of it.
 *
 * Depth-1 collapses to a rule that can be stated in one line and checked in two
 * queries: nobody may be a delegator and a delegate at the same time.
 */
@CommandHandler(GrantDelegationCommand)
export class GrantDelegationHandler
  implements ICommandHandler<GrantDelegationCommand, DelegationView>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(DELEGATION_REPOSITORY)
    private readonly delegations: DelegationRepository,
    @Inject(DELEGATION_QUERY)
    private readonly delegationView: DelegationQueryPort,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
    private readonly notifier: NotificationEmitter,
  ) {}

  async execute({ input }: GrantDelegationCommand): Promise<DelegationView> {
    const delegatorId = Identifier.of(input.delegatorId)
    if (!(await this.users.findById(delegatorId)))
      throw new EntityNotFoundError('User', input.delegatorId)

    const delegateId = Identifier.of(input.delegateId)
    if (!(await this.users.findById(delegateId)))
      throw new EntityNotFoundError('User', input.delegateId)

    const start = parseDate(input.startDate)
    const end = parseDate(input.endDate)

    // Checked at the start of the new window rather than at "now": a
    // delegation granted today for next month must not create a chain next
    // month either, and a check against the current clock would miss it.
    if (await this.delegations.activeToDelegate(delegatorId, start))
      throw new InvariantViolationError(
        'You are currently acting on behalf of someone else and cannot pass that authority on. Delegation is limited to one step.',
      )

    if (await this.delegations.activeFor(delegateId, start))
      throw new InvariantViolationError(
        'The chosen delegate has already delegated their own authority to someone else. Delegation is limited to one step.',
      )

    const delegation = Delegation.create(this.ids.next(), {
      delegatorId,
      delegateId,
      start,
      end,
      reason: input.reason,
    })
    await this.delegations.save(delegation)

    const view = await this.delegationView.getById(delegation.id.toString())
    if (!view)
      throw new EntityNotFoundError('Delegation', delegation.id.toString())

    await this.notifier.delegationGranted({
      delegatorId: view.delegatorId,
      delegateId: view.delegateId,
      delegatorName: view.delegatorName.en ?? view.delegatorName.ar,
      delegateName: view.delegateName.en ?? view.delegateName.ar,
      startDate: view.startDate,
      endDate: view.endDate,
    })

    return view
  }
}

function parseDate(value: string): Date {
  const date = new Date(value)
  if (Number.isNaN(date.getTime()))
    throw new InvariantViolationError(`Invalid date: ${value}`)
  return date
}
