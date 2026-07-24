import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Priority } from '../../../../domain/request/enums'
import { Identifier } from '../../../../domain/shared/identifier'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import { REQUEST_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
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
  ) {}

  async execute({
    input,
  }: ClassifyRequestByModelCommand): Promise<ClassificationResult> {
    const request = await this.requests.findById(Identifier.of(input.requestId))
    if (!request) throw new EntityNotFoundError('Request', input.requestId)

    request.classifyByModel(
      Identifier.of(input.templateId),
      input.confidence,
      input.threshold,
      input.suggestedPriority
        ? (input.suggestedPriority as Priority)
        : undefined,
    )
    await this.requests.save(request)
    return {
      id: request.id.toString(),
      classificationStatus: request.classificationStatus,
    }
  }
}
