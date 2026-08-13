import { ICommandHandler } from '@nestjs/cqrs';
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository';
import { ActivateWorkflowPathCommand } from './activate-workflow-path.command';
export interface WorkflowPathStateResult {
    id: string;
    isActive: boolean;
}
export declare class ActivateWorkflowPathHandler implements ICommandHandler<ActivateWorkflowPathCommand, WorkflowPathStateResult> {
    private readonly workflowPaths;
    constructor(workflowPaths: WorkflowPathRepository);
    execute({ workflowPathId, }: ActivateWorkflowPathCommand): Promise<WorkflowPathStateResult>;
}
