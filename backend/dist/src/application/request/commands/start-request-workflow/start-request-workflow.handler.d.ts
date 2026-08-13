import { ICommandHandler } from '@nestjs/cqrs';
import type { RequestRepository } from '../../../../domain/request/ports/request.repository';
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import { EventRecorder } from '../../../observability/services/event-recorder';
import { StartRequestWorkflowCommand } from './start-request-workflow.command';
import { AssigneeResolver } from '../../services/assignee-resolver';
import { NotificationEmitter } from '../../../observability/services/notification-emitter';
import { BusinessHoursService } from '../../../observability/services/business-hours.service';
export interface StartWorkflowResult {
    id: string;
    workflowPathId: string;
    stepCount: number;
    assignedStepCount: number;
    unassignedStepCount: number;
}
export declare class StartRequestWorkflowHandler implements ICommandHandler<StartRequestWorkflowCommand, StartWorkflowResult> {
    private readonly requests;
    private readonly workflowPaths;
    private readonly ids;
    private readonly assignees;
    private readonly notifier;
    private readonly businessHours;
    private readonly events;
    constructor(requests: RequestRepository, workflowPaths: WorkflowPathRepository, ids: IdGenerator, assignees: AssigneeResolver, notifier: NotificationEmitter, businessHours: BusinessHoursService, events: EventRecorder);
    execute(command: StartRequestWorkflowCommand): Promise<StartWorkflowResult>;
}
