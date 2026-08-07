import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Priority, RequestStatus } from '../../../../domain/request/enums'
import { RequestAction } from '../../../../domain/request/request-action'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import { Identifier } from '../../../../domain/shared/identifier'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import type { TransactionRunner } from '../../../../domain/shared/transaction-runner'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { RequestActionRepository } from '../../../../domain/request/ports/request-action.repository'
import type { ActionTypeRepository } from '../../../../domain/catalog/ports/catalog-lookup.repository'
import {
  ACTION_TYPE_REPOSITORY,
  ID_GENERATOR,
  REQUEST_ACTION_REPOSITORY,
  REQUEST_REPOSITORY,
  TRANSACTION_RUNNER,
} from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { EventRecorder } from '../../../observability/services/event-recorder'
import { ChangeRequestPriorityCommand } from './change-request-priority.command'

/**
 * The seeded action type this records itself as. Looked up by code rather than
 * taken from the caller: the caller is asking to change a priority, not choosing
 * how that change is filed.
 */
export const CHANGE_PRIORITY_ACTION_CODE = 'CHANGE_PRIORITY'

/** Priority may still move while a request is live, but not after it is over. */
const OPEN_STATUSES: readonly string[] = [
  RequestStatus.DRAFT,
  RequestStatus.IN_PROGRESS,
  RequestStatus.ON_HOLD,
]

export interface PriorityChangeResult {
  id: string
  previousPriority: string
  priority: string
}

/**
 * Changes one request's priority and files the decision as a request action in
 * the same transaction.
 *
 * Both halves commit together on purpose. A priority that moved with no action
 * row beside it is the one outcome worse than not being able to change it at
 * all: the queue order changes and nothing in the system can say who decided or
 * why.
 */
@CommandHandler(ChangeRequestPriorityCommand)
export class ChangeRequestPriorityHandler
  implements ICommandHandler<ChangeRequestPriorityCommand, PriorityChangeResult>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(REQUEST_ACTION_REPOSITORY)
    private readonly actions: RequestActionRepository,
    @Inject(ACTION_TYPE_REPOSITORY)
    private readonly actionTypes: ActionTypeRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
    @Inject(TRANSACTION_RUNNER) private readonly transaction: TransactionRunner,
    private readonly events: EventRecorder,
  ) {}

  async execute({
    input,
  }: ChangeRequestPriorityCommand): Promise<PriorityChangeResult> {
    const request = await this.requests.findById(Identifier.of(input.requestId))
    if (!request) throw new EntityNotFoundError('Request', input.requestId)

    if (!OPEN_STATUSES.includes(request.status))
      throw new InvariantViolationError(
        `A request that is ${request.status} cannot be re-prioritised.`,
      )

    const actionType = await this.actionTypes.findByCode(
      CHANGE_PRIORITY_ACTION_CODE,
    )
    if (!actionType)
      throw new EntityNotFoundError('ActionType', CHANGE_PRIORITY_ACTION_CODE)

    const previousPriority = request.snapshot().priority
    const next = input.priority as Priority
    request.changePriority(next)

    await this.transaction.run(async () => {
      await this.requests.save(request)
      await this.actions.append(
        RequestAction.create(this.ids.next(), {
          requestId: request.id,
          actorId: Identifier.of(input.actorId),
          actionTypeId: actionType.id,
          // Both values in the comment, so the trail reads without having to
          // reconstruct what the priority used to be from earlier rows.
          comment: `${previousPriority} -> ${next}: ${input.reason}`,
        }),
      )
      await this.events.actionTaken({
        requestId: request.id.toString(),
        actorId: input.actorId,
        actionTypeId: actionType.id.toString(),
      })
    })

    return {
      id: request.id.toString(),
      previousPriority,
      priority: next,
    }
  }
}
