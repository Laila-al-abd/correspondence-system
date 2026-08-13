import { IQueryHandler } from '@nestjs/cqrs';
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository';
import { GetWorkflowPathQuery } from './get-workflow-path.query';
import { WorkflowPathView } from '../views/workflow-path.view';
export declare class GetWorkflowPathHandler implements IQueryHandler<GetWorkflowPathQuery, WorkflowPathView> {
    private readonly workflowPaths;
    constructor(workflowPaths: WorkflowPathRepository);
    execute({ workflowPathId, }: GetWorkflowPathQuery): Promise<WorkflowPathView>;
}
