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

    const delegation = Delegation.create(this.ids.next(), {
      delegatorId,
      delegateId,
      start: parseDate(input.startDate),
      end: parseDate(input.endDate),
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
