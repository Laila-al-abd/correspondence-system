import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { RequestAction } from '../../../../domain/request/request-action'
import { RequestStatus } from '../../../../domain/request/enums'
import { Identifier } from '../../../../domain/shared/identifier'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { RequestActionRepository } from '../../../../domain/request/ports/request-action.repository'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import type { TransactionRunner } from '../../../../domain/shared/transaction-runner'
import {
  ID_GENERATOR,
  REQUEST_ACTION_REPOSITORY,
  REQUEST_REPOSITORY,
  TRANSACTION_RUNNER,
} from '../../../tokens'
import { EntityNotFoundError, ForbiddenActionError } from '../../../errors'
import { NotificationEmitter } from '../../../observability/services/notification-emitter'
import { BusinessHoursService } from '../../../observability/services/business-hours.service'
import { ActOnStepCommand, StepActionKind } from './act-on-step.command'

export interface ActOnStepResult {
  stepInstanceId: string
  stepStatus: string
  requestStatus: string
}

/**
 * The runtime heart: an actor moves one step through its state machine and the
 * decision is recorded in the immutable audit log. Once every step reaches a
 * terminal state the request completes automatically -- the same rule the
 * aggregate enforces in complete(). Request-level reject / hold / cancel remain
 * explicit aggregate operations for later endpoints.
 */
@CommandHandler(ActOnStepCommand)
export class ActOnStepHandler
  implements ICommandHandler<ActOnStepCommand, ActOnStepResult>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(REQUEST_ACTION_REPOSITORY)
    private readonly actions: RequestActionRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactions: TransactionRunner,
    private readonly notifier: NotificationEmitter,
    private readonly businessHours: BusinessHoursService,
  ) {}

  /**
   * The decision is committed first, then people are told about it.
   *
   * Everything that changes the database -- the step transition, the audit
   * action row and the request root -- happens inside one transaction, so a
   * failure halfway through cannot leave an action logged against a step that
   * never moved. Notifications are deliberately sent afterwards: a message
   * cannot be un-sent, so announcing an approval that then rolls back would be
   * worse than announcing it a moment late.
   */
  async execute(command: ActOnStepCommand): Promise<ActOnStepResult> {
    const { input } = command
    const { request, step, statusBefore } = await this.transactions.run(() =>
      this.applyAction(command),
    )

    // Tell the owner what happened. Notifying is best-effort inside the
    // emitter, so a notification failure can never undo the decision above.
    const requesterId = request.requesterId.toString()
    await this.notifier.actionTaken({
      userId: requesterId,
      actorId: input.actorId,
      requestId: request.id.toString(),
      referenceNo: request.referenceNo,
      action: input.action,
    })
    if (request.status !== statusBefore) {
      await this.notifier.requestStateChanged({
        userId: requesterId,
        actorId: input.actorId,
        requestId: request.id.toString(),
        referenceNo: request.referenceNo,
        status: request.status,
      })
    }

    return {
      stepInstanceId: step.id.toString(),
      stepStatus: step.status,
      requestStatus: request.status,
    }
  }

  private async applyAction(command: ActOnStepCommand) {
    const { input } = command
    const request = await this.requests.findById(Identifier.of(input.requestId))
    if (!request) throw new EntityNotFoundError('Request', input.requestId)

    const step = request.stepInstances.find(
      (si) => si.id.toString() === input.stepInstanceId,
    )
    if (!step)
      throw new EntityNotFoundError('Step instance', input.stepInstanceId)

    if (step.assignedToUserId?.toString() !== input.actorId)
      throw new ForbiddenActionError(
        'You can only act on steps assigned to you.',
      )

    const statusBefore = request.status

    switch (input.action) {
      case StepActionKind.START:
        step.start()
        break
      case StepActionKind.COMPLETE:
        step.complete()
        break
      case StepActionKind.REJECT:
        step.reject()
        break
      case StepActionKind.SKIP:
        step.skip()
        break
      default:
        throw new InvariantViolationError(
          `Unknown step action "${input.action}".`,
        )
    }

    if (input.actionTypeId) {
      const action = RequestAction.create(this.ids.next(), {
        actorId: Identifier.of(input.actorId),
        actionTypeId: Identifier.of(input.actionTypeId),
        requestStepInstanceId: step.id,
        comment: input.comment,
      })
      await this.actions.append(action, request.id)
    }

    if (
      request.status === RequestStatus.IN_PROGRESS &&
      request.stepInstances.every((si) => si.isTerminal())
    ) {
      request.complete()
      // Measure the finished request once, here, while the policy that defines
      // "a working hour" is the one that was actually in force. A failure to
      // measure must not undo somebody's approval, so this is best-effort: the
      // request completes either way and the column simply stays null.
      const startedAt = request.createdAt
      const finishedAt = request.completedAt
      if (startedAt && finishedAt) {
        try {
          const hours = await this.businessHours.workingHoursBetween(
            startedAt,
            finishedAt,
          )
          request.recordBusinessDuration(hours * 60)
        } catch {
          // Left unmeasured on purpose. An average over the rows that do carry
          // a duration is still honest; a wrong number would not be.
        }
      }
    }

    await this.requests.save(request)

    return { request, step, statusBefore }
  }
}
