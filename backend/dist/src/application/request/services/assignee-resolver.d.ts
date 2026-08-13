import type { WorkflowPath } from '../../../domain/workflow/workflow-path';
import type { WorkflowStep } from '../../../domain/workflow/workflow-step';
import { Identifier } from '../../../domain/shared/identifier';
import type { AssigneeCandidate, AssigneeDirectoryPort } from '../ports/assignee-directory.port';
export declare class AssigneeResolver {
    private readonly directory;
    constructor(directory: AssigneeDirectoryPort);
    resolveForPath(path: WorkflowPath, requesterId: Identifier, onlyStepIds?: ReadonlySet<string>): Promise<Map<string, Identifier>>;
    private resolveCandidates;
    private resolveUpwards;
    private applyDelegation;
    candidatesForStep(step: WorkflowStep, requesterId: Identifier): Promise<AssigneeCandidate[]>;
    assignableUsersForStep(step: WorkflowStep, requesterId: Identifier): Promise<{
        recommended: AssigneeCandidate[];
        wider: AssigneeCandidate[];
    }>;
    resolveOwnerForStep(step: WorkflowStep, requesterId: Identifier): Promise<Identifier | undefined>;
    currentDelegateFor(userId: string, requesterId: Identifier): Promise<string>;
}
