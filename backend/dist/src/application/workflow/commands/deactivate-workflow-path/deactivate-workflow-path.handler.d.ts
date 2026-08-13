import { ICommandHandler } from '@nestjs/cqrs';
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository';
import { WorkflowPathStateResult } from '../activate-workflow-path/activate-workflow-path.handler';
import { DeactivateWorkflowPathCommand } from './deactivate-workflow-path.command';
export declare class DeactivateWorkflowPathHandler implements ICommandHandler<DeactivateWorkflowPathCommand, WorkflowPathStateResult> {
    private readonly workflowPaths;
    constructor(workflowPaths: WorkflowPathRepository);
    execute({ workflowPathId, }: DeactivateWorkflowPathCommand): Promise<WorkflowPathStateResult>;
}
