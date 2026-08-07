import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Identifier } from '../../../../domain/shared/identifier'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import { NotificationEmitter } from '../../../observability/services/notification-emitter'
import {
  EntityNotFoundError,
  FilledDataInvalidError,
  ForbiddenActionError,
} from '../../../errors'
import { REQUEST_REPOSITORY, TEMPLATE_REPOSITORY } from '../../../tokens'
import { EventRecorder } from '../../../observability/services/event-recorder'
import { stageOfRequest } from '../../queries/views/request-stage'
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
    @Inject(TEMPLATE_REPOSITORY) private readonly templates: TemplateRepository,
    private readonly notifier: NotificationEmitter,
    private readonly events: EventRecorder,
  ) {}

  async execute({ input }: ConfirmRequestCommand): Promise<ConfirmationResult> {
    const request = await this.requests.findById(Identifier.of(input.requestId))
    if (!request) throw new EntityNotFoundError('Request', input.requestId)

    if (request.requesterId.toString() !== input.actorId)
      throw new ForbiddenActionError(
        'Only the person who submitted a request can confirm what was extracted from it.',
      )

    const stageBefore = stageOfRequest(request)

    if (input.outcome === 'CONFIRM') {
      if (input.filledData) request.applyRequesterValues(input.filledData)

      const templateId = request.templateId
      if (!templateId)
        throw new ForbiddenActionError(
          'There is nothing to confirm until the request has been classified.',
        )
      const template = await this.templates.findById(templateId)
      if (!template)
        throw new EntityNotFoundError('Template', templateId.toString())

      // The completeness check the extractor is deliberately spared. A model
      // that abstains on a required field is behaving correctly -- inventing a
      // value would be worse -- but an incomplete form must not reach the first
      // desk in the workflow, and this is the last moment the one person who
      // knows the answer is still in the loop. Every violation is reported at
      // once, because a requester sent back one field at a time gives up.
      const violations = template.validateFilledData(request.filledData ?? {})
      if (violations.length > 0) throw new FilledDataInvalidError(violations)

      request.confirm()
      await this.requests.save(request)
      await this.events.statusChanged({
        requestId: request.id.toString(),
        from: stageBefore,
        to: stageOfRequest(request),
        actorId: input.actorId,
      })
    } else {
      request.dispute()
      await this.requests.save(request)
      // A dispute is logged the same way an approval is. It is the requester
      // rejecting what the models proposed, and it is the row that explains why
      // this request appears in the review queue a second time.
      await this.events.statusChanged({
        requestId: request.id.toString(),
        from: stageBefore,
        to: stageOfRequest(request),
        actorId: input.actorId,
      })
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
