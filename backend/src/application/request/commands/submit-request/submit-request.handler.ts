import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Request } from '../../../../domain/request/request'
import { Priority } from '../../../../domain/request/enums'
import { Identifier } from '../../../../domain/shared/identifier'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { ReferenceNumberGenerator } from '../../../../domain/request/ports/reference-number-generator'
import {
  ID_GENERATOR,
  REFERENCE_NUMBER_GENERATOR,
  REQUEST_REPOSITORY,
} from '../../../tokens'
import { SubmitRequestCommand } from './submit-request.command'

export interface SubmitRequestResult {
  id: string
  referenceNo: string
}

/**
 * Creates a new correspondence request in DRAFT. The requester writes free text
 * (later classified by the NLP model) and optionally pre-fills form data.
 */
@CommandHandler(SubmitRequestCommand)
export class SubmitRequestHandler
  implements ICommandHandler<SubmitRequestCommand, SubmitRequestResult>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
    @Inject(REFERENCE_NUMBER_GENERATOR)
    private readonly referenceNumbers: ReferenceNumberGenerator,
  ) {}

  async execute({ input }: SubmitRequestCommand): Promise<SubmitRequestResult> {
    const referenceNo = await this.referenceNumbers.next()
    const request = Request.create(this.ids.next(), {
      requesterId: Identifier.of(input.requesterId),
      referenceNo,
      rawText: input.rawText,
      priority: input.priority ? (input.priority as Priority) : undefined,
    })
    if (input.filledData) request.setFilledData(input.filledData)
    await this.requests.save(request)
    return { id: request.id.toString(), referenceNo }
  }
}
