import { IQueryHandler } from '@nestjs/cqrs';
import type { RequestRepository } from '../../../../domain/request/ports/request.repository';
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository';
import { AssigneeResolver } from '../../services/assignee-resolver';
import { ListStepCandidatesQuery } from './list-step-candidates.query';
export interface StepCandidateView {
    userId: string;
    openStepCount: number;
    recommended: boolean;
}
export interface StepCandidatesView {
    stepInstanceId: string;
    workflowStepId: string;
    stepName?: string;
    assigneeType?: string;
    assigneeRoleId?: string;
    currentAssigneeUserId?: string;
    candidates: StepCandidateView[];
    unrestricted: boolean;
}
export declare class ListStepCandidatesHandler implements IQueryHandler<ListStepCandidatesQuery, StepCandidatesView> {
    private readonly requests;
    private readonly workflowPaths;
    private readonly assignees;
    constructor(requests: RequestRepository, workflowPaths: WorkflowPathRepository, assignees: AssigneeResolver);
    execute(query: ListStepCandidatesQuery): Promise<StepCandidatesView>;
}
