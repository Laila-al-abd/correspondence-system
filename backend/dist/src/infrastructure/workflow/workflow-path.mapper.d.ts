import { Prisma } from '../../../generated/prisma/client';
import { WorkflowPath } from '../../domain/workflow/workflow-path';
export declare const workflowPathInclude: {
    steps: {
        include: {
            allowedActions: true;
            dependencies: true;
        };
    };
};
type WorkflowPathRow = Prisma.WorkflowPathGetPayload<{
    include: typeof workflowPathInclude;
}>;
export declare const WorkflowPathMapper: {
    toDomain(row: WorkflowPathRow): WorkflowPath;
    toRoot(path: WorkflowPath): Prisma.WorkflowPathUncheckedCreateInput;
};
export {};
