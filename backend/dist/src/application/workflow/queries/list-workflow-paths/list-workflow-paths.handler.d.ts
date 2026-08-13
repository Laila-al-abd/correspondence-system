import { IQueryHandler } from '@nestjs/cqrs';
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository';
import { ListWorkflowPathsByTemplateQuery } from './list-workflow-paths.query';
import { WorkflowPathView } from '../views/workflow-path.view';
export declare class ListWorkflowPathsByTemplateHandler implements IQueryHandler<ListWorkflowPathsByTemplateQuery, WorkflowPathView[]> {
    private readonly workflowPaths;
    constructor(workflowPaths: WorkflowPathRepository);
    execute({ templateId, }: ListWorkflowPathsByTemplateQuery): Promise<WorkflowPathView[]>;
}
