import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Request } from '../../../../domain/request/request'
import { Identifier } from '../../../../domain/shared/identifier'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { ReferenceNumberGenerator } from '../../../../domain/request/ports/reference-number-generator'
import type { TransactionRunner } from '../../../../domain/shared/transaction-runner'
import {
  ID_GENERATOR,
  REFERENCE_NUMBER_GENERATOR,
  REQUEST_REPOSITORY,
  TRANSACTION_RUNNER,
} from '../../../tokens'
import { EventRecorder } from '../../../observability/services/event-recorder'
import { stageOfRequest } from '../../queries/views/request-stage'
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
    @Inject(TRANSACTION_RUNNER)
    private readonly transactions: TransactionRunner,
    private readonly events: EventRecorder,
  ) {}

  /**
   * Reserving the reference number and inserting the request are one unit of
   * work. Previously the counter was bumped first and committed on its own, so
   * a request that failed to insert still consumed a number and left a hole in
   * a sequence the registry treats as gapless. Inside the transaction, a failed
   * submission rolls the counter back with it.
   */
  async execute(command: SubmitRequestCommand): Promise<SubmitRequestResult> {
    return this.transactions.run(() => this.createRequest(command))
  }

  private async createRequest({
    input,
  }: SubmitRequestCommand): Promise<SubmitRequestResult> {
    const referenceNo = await this.referenceNumbers.next()
    const request = Request.create(this.ids.next(), {
      requesterId: Identifier.of(input.requesterId),
      referenceNo,
      rawText: input.rawText,
    })
    if (input.filledData) request.setFilledData(input.filledData)
    await this.requests.save(request)
    // Where the trail starts. `from` is left null on purpose: there was no
    // previous stage, because before this row there was no request.
    await this.events.statusChanged({
      requestId: request.id.toString(),
      to: stageOfRequest(request),
      actorId: input.requesterId,
    })
    return { id: request.id.toString(), referenceNo }
  }
}
