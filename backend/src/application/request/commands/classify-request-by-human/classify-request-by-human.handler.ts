import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Priority } from '../../../../domain/request/enums'
import { Identifier } from '../../../../domain/shared/identifier'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import { REQUEST_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { ClassifyRequestByHumanCommand } from './classify-request-by-human.command'

export interface HumanClassificationResult {
  id: string
  classificationStatus: string
}

/**
 * A human resolves the classification (the HITL path): they confirm the
 * template and may set the priority. Used when the model was not confident.
 */
@CommandHandler(ClassifyRequestByHumanCommand)
export class ClassifyRequestByHumanHandler
  implements
    ICommandHandler<ClassifyRequestByHumanCommand, HumanClassificationResult>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
  ) {}

  async execute({
    input,
  }: ClassifyRequestByHumanCommand): Promise<HumanClassificationResult> {
    const request = await this.requests.findById(Identifier.of(input.requestId))
    if (!request) throw new EntityNotFoundError('Request', input.requestId)

    request.classifyByHuman(
      Identifier.of(input.templateId),
      input.priority ? (input.priority as Priority) : undefined,
    )
    await this.requests.save(request)
    return {
      id: request.id.toString(),
      classificationStatus: request.classificationStatus,
    }
  }
}
