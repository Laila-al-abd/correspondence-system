import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
  ClassificationStatus,
  Priority,
} from '../../../../domain/request/enums'
import { Identifier } from '../../../../domain/shared/identifier'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import { REQUEST_REPOSITORY, TEMPLATE_REPOSITORY } from '../../../tokens'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import { EntityNotFoundError } from '../../../errors'
import { NotificationEmitter } from '../../../observability/services/notification-emitter'
import { ClassifyRequestByModelCommand } from './classify-request-by-model.command'

export interface ClassificationResult {
  id: string
  classificationStatus: string
}

/**
 * Applies an automatic (AraBERT) classification. The model may also suggest an
 * initial priority; the aggregate only trusts it above the confidence
 * threshold, otherwise the request drops to the human-in-the-loop queue.
 */
@CommandHandler(ClassifyRequestByModelCommand)
export class ClassifyRequestByModelHandler
  implements ICommandHandler<ClassifyRequestByModelCommand, ClassificationResult>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(TEMPLATE_REPOSITORY) private readonly templates: TemplateRepository,
    private readonly notifier: NotificationEmitter,
  ) {}

  async execute({
    input,
  }: ClassifyRequestByModelCommand): Promise<ClassificationResult> {
    const request = await this.requests.findById(Identifier.of(input.requestId))
    if (!request) throw new EntityNotFoundError('Request', input.requestId)

    const template = await this.templates.findById(
      Identifier.of(input.templateId),
    )
    if (!template) throw new EntityNotFoundError('Template', input.templateId)

    request.classifyByModel(
      Identifier.of(input.templateId),
      input.confidence,
      input.threshold,
      input.suggestedPriority
        ? (input.suggestedPriority as Priority)
        : undefined,
    )
    await this.requests.save(request)

    // Below the confidence threshold the aggregate parks the request in the
    // human-in-the-loop queue. Nobody owns it yet, so every reviewer is alerted.
    if (request.classificationStatus === ClassificationStatus.HITL) {
      await this.notifier.classificationNeedsReview({
        requestId: request.id.toString(),
        referenceNo: request.referenceNo,
      })
    }

    return {
      id: request.id.toString(),
      classificationStatus: request.classificationStatus,
    }
  }
}
