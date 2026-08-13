import { ICommandHandler } from '@nestjs/cqrs';
import type { RequestRepository } from '../../../../domain/request/ports/request.repository';
import type { RequestActionRepository } from '../../../../domain/request/ports/request-action.repository';
import type { PaymentRepository } from '../../../../domain/request/ports/payment.repository';
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository';
import type { ActionTypeRepository } from '../../../../domain/catalog/ports/catalog-lookup.repository';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import type { TransactionRunner } from '../../../../domain/shared/transaction-runner';
import { NotificationEmitter } from '../../../observability/services/notification-emitter';
import { BusinessHoursService } from '../../../observability/services/business-hours.service';
import { EventRecorder } from '../../../observability/services/event-recorder';
import { AssigneeResolver } from '../../services/assignee-resolver';
import type { AssigneeDirectoryPort } from '../../ports/assignee-directory.port';
import { ActOnStepCommand } from './act-on-step.command';
export interface ActOnStepResult {
    stepInstanceId: string;
    stepStatus: string;
    requestStatus: string;
}
export declare class ActOnStepHandler implements ICommandHandler<ActOnStepCommand, ActOnStepResult> {
    private readonly requests;
    private readonly actions;
    private readonly payments;
    private readonly workflowPaths;
    private readonly actionTypes;
    private readonly ids;
    private readonly transactions;
    private readonly directory;
    private readonly assignees;
    private readonly notifier;
    private readonly businessHours;
    private readonly events;
    constructor(requests: RequestRepository, actions: RequestActionRepository, payments: PaymentRepository, workflowPaths: WorkflowPathRepository, actionTypes: ActionTypeRepository, ids: IdGenerator, transactions: TransactionRunner, directory: AssigneeDirectoryPort, assignees: AssigneeResolver, notifier: NotificationEmitter, businessHours: BusinessHoursService, events: EventRecorder);
    execute(command: ActOnStepCommand): Promise<ActOnStepResult>;
    private assertTerminalActionType;
    private applyAction;
    private loadPath;
    private definitionOf;
    private dependencyMap;
    private assertDependenciesSatisfied;
    private releaseSuccessors;
    private refreshOwnership;
    private feeFor;
    private requestFee;
    private assertFeeSettled;
}
