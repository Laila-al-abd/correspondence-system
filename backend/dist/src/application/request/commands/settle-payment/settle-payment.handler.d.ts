import { ICommandHandler } from '@nestjs/cqrs';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import type { TransactionRunner } from '../../../../domain/shared/transaction-runner';
import type { PaymentRepository } from '../../../../domain/request/ports/payment.repository';
import type { RequestActionRepository } from '../../../../domain/request/ports/request-action.repository';
import type { ActionTypeRepository } from '../../../../domain/catalog/ports/catalog-lookup.repository';
import { EventRecorder } from '../../../observability/services/event-recorder';
import { SettlePaymentCommand } from './settle-payment.command';
export interface SettlePaymentResult {
    id: string;
    status: string;
    settledAt?: string;
}
export declare class SettlePaymentHandler implements ICommandHandler<SettlePaymentCommand, SettlePaymentResult> {
    private readonly payments;
    private readonly actions;
    private readonly actionTypes;
    private readonly ids;
    private readonly transaction;
    private readonly events;
    constructor(payments: PaymentRepository, actions: RequestActionRepository, actionTypes: ActionTypeRepository, ids: IdGenerator, transaction: TransactionRunner, events: EventRecorder);
    execute({ input, }: SettlePaymentCommand): Promise<SettlePaymentResult>;
}
