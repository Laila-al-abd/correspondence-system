import { ICommandHandler } from '@nestjs/cqrs';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import type { RequestRepository } from '../../../../domain/request/ports/request.repository';
import type { ReferenceNumberGenerator } from '../../../../domain/request/ports/reference-number-generator';
import type { TransactionRunner } from '../../../../domain/shared/transaction-runner';
import { EventRecorder } from '../../../observability/services/event-recorder';
import { SubmitRequestCommand } from './submit-request.command';
export interface SubmitRequestResult {
    id: string;
    referenceNo: string;
}
export declare class SubmitRequestHandler implements ICommandHandler<SubmitRequestCommand, SubmitRequestResult> {
    private readonly requests;
    private readonly ids;
    private readonly referenceNumbers;
    private readonly transactions;
    private readonly events;
    constructor(requests: RequestRepository, ids: IdGenerator, referenceNumbers: ReferenceNumberGenerator, transactions: TransactionRunner, events: EventRecorder);
    execute(command: SubmitRequestCommand): Promise<SubmitRequestResult>;
    private createRequest;
}
