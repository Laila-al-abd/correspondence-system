import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Identifier } from '../../../../domain/shared/identifier'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import { NotificationEmitter } from '../../../observability/services/notification-emitter'
import { EntityNotFoundError, ForbiddenActionError } from '../../../errors'
import { REQUEST_REPOSITORY } from '../../../tokens'
import {
  ConfirmOutcome,
  ConfirmRequestCommand,
} from './confirm-request.command'

export interface ConfirmationResult {
  id: string
  outcome: ConfirmOutcome
  classificationStatus: string
  confirmedAt?: string
}

/**
 * The requester's verdict on what the models proposed.
 *
 * Two outcomes, one endpoint, because they are one decision. **Confirm** stamps
 * the request and lets a workflow start. **Dispute** sends it to human review
 * and drops the extracted values, which is deliberately the same destination
 * that a low-confidence classification reaches: a person disagreeing with the
 * model and the model doubting itself need identical handling, so the review
 * queue stays the single place where classification is repaired.
 *
 * Only the requester may answer. Confirmation is what makes staff approvals
 * meaningful -- it is the record that a human vouched for these values before
 * anyone acted on them -- and it is worth nothing if a third party can supply
 * it on their behalf. Which is also why the actor comes from the access token
 * rather than the request body.
 */
@CommandHandler(ConfirmRequestCommand)
export class ConfirmRequestHandler
  implements ICommandHandler<ConfirmRequestCommand, ConfirmationResult>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    private readonly notifier: NotificationEmitter,
  ) {}

  async execute({ input }: ConfirmRequestCommand): Promise<ConfirmationResult> {
    const request = await this.requests.findById(Identifier.of(input.requestId))
    if (!request) throw new EntityNotFoundError('Request', input.requestId)

    if (request.requesterId.toString() !== input.actorId)
      throw new ForbiddenActionError(
        'Only the person who submitted a request can confirm what was extracted from it.',
      )

    if (input.outcome === 'CONFIRM') {
      request.confirm()
      await this.requests.save(request)
    } else {
      request.dispute()
      await this.requests.save(request)
      // Told after the save, and only then: a reviewer who follows the
      // notification must find the request already waiting in their queue.
      await this.notifier.classificationNeedsReview({
        requestId: request.id.toString(),
        referenceNo: request.referenceNo,
      })
    }

    return {
      id: request.id.toString(),
      outcome: input.outcome,
      classificationStatus: request.classificationStatus,
      confirmedAt: request.confirmedAt?.toISOString(),
    }
  }
}
