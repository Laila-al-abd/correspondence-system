import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Identifier } from '../../../../domain/shared/identifier'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import { REQUEST_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { NotificationEmitter } from '../../../observability/services/notification-emitter'
import { EventRecorder } from '../../../observability/services/event-recorder'
import { stageOfRequest } from '../../queries/views/request-stage'
import { FlagForHumanClassificationCommand } from './flag-for-human-classification.command'

export interface FlagForHumanClassificationResult {
  id: string
  classificationStatus: string
}

/**
 * Hands a request the classifier could not place to the review queue.
 *
 * The AI service calls this after every candidate it proposed has been
 * refused -- ineligible requester, or form data that contradicts each
 * template. Before it existed the worker simply returned, which left the
 * request DRAFT/PENDING: still visible in the reviewer inbox, but
 * indistinguishable from one nobody had processed yet, with no alert raised
 * and the worker re-reading and re-failing it on every poll for as long as it
 * existed.
 *
 * Deliberately behind `request.classify` rather than a service-only door. This
 * is the same decision a reviewer makes when they give up on a request, and
 * there is no reason a person holding the classification permission should not
 * be able to make it by hand.
 */
@CommandHandler(FlagForHumanClassificationCommand)
export class FlagForHumanClassificationHandler
  implements
    ICommandHandler<
      FlagForHumanClassificationCommand,
      FlagForHumanClassificationResult
    >
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    private readonly notifier: NotificationEmitter,
    private readonly events: EventRecorder,
  ) {}

  async execute({
    requestId,
  }: FlagForHumanClassificationCommand): Promise<FlagForHumanClassificationResult> {
    const request = await this.requests.findById(Identifier.of(requestId))
    if (!request) throw new EntityNotFoundError('Request', requestId)

    // Already in the queue: say so and stop. Re-saving would be harmless, but
    // re-notifying would not -- a caller retrying a dropped response must not
    // alert every reviewer a second time.
    if (request.classificationStatus === 'HITL')
      return {
        id: request.id.toString(),
        classificationStatus: request.classificationStatus,
      }

    const stageBefore = stageOfRequest(request)

    request.flagForHumanClassification()
    await this.requests.save(request)

    await this.events.statusChanged({
      requestId: request.id.toString(),
      from: stageBefore,
      to: stageOfRequest(request),
    })

    // The same alert low confidence raises. Nobody owns this request yet, so
    // it goes to every reviewer rather than to a person.
    await this.notifier.classificationNeedsReview({
      requestId: request.id.toString(),
      referenceNo: request.referenceNo,
    })

    return {
      id: request.id.toString(),
      classificationStatus: request.classificationStatus,
    }
  }
}
