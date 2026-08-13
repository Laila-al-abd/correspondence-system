import { ICommandHandler } from '@nestjs/cqrs';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import type { TransactionRunner } from '../../../../domain/shared/transaction-runner';
import type { RequestRepository } from '../../../../domain/request/ports/request.repository';
import type { RequestActionRepository } from '../../../../domain/request/ports/request-action.repository';
import type { ActionTypeRepository } from '../../../../domain/catalog/ports/catalog-lookup.repository';
import { EventRecorder } from '../../../observability/services/event-recorder';
import { ChangeRequestPriorityCommand } from './change-request-priority.command';
export declare const CHANGE_PRIORITY_ACTION_CODE = "CHANGE_PRIORITY";
export interface PriorityChangeResult {
    id: string;
    previousPriority: string;
    priority: string;
}
export declare class ChangeRequestPriorityHandler implements ICommandHandler<ChangeRequestPriorityCommand, PriorityChangeResult> {
    private readonly requests;
    private readonly actions;
    private readonly actionTypes;
    private readonly ids;
    private readonly transaction;
    private readonly events;
    constructor(requests: RequestRepository, actions: RequestActionRepository, actionTypes: ActionTypeRepository, ids: IdGenerator, transaction: TransactionRunner, events: EventRecorder);
    execute({ input, }: ChangeRequestPriorityCommand): Promise<PriorityChangeResult>;
}
