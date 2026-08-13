import { ICommandHandler } from '@nestjs/cqrs';
import type { RequestRepository } from '../../../../domain/request/ports/request.repository';
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository';
import type { AssigneeDirectoryPort } from '../../ports/assignee-directory.port';
import { AssigneeResolver } from '../../services/assignee-resolver';
import { NotificationEmitter } from '../../../observability/services/notification-emitter';
import { EventRecorder } from '../../../observability/services/event-recorder';
import { AssignStepCommand } from './assign-step.command';
export interface AssignStepResult {
    stepInstanceId: string;
    assignedToUserId: string;
}
export declare class AssignStepHandler implements ICommandHandler<AssignStepCommand, AssignStepResult> {
    private readonly requests;
    private readonly workflowPaths;
    private readonly directory;
    private readonly assignees;
    private readonly notifier;
    private readonly events;
    constructor(requests: RequestRepository, workflowPaths: WorkflowPathRepository, directory: AssigneeDirectoryPort, assignees: AssigneeResolver, notifier: NotificationEmitter, events: EventRecorder);
    execute({ input }: AssignStepCommand): Promise<AssignStepResult>;
    private assertAssignable;
}
