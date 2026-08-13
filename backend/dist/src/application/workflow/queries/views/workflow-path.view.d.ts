import { AssigneeType } from '../../../../domain/workflow/enums';
import { WorkflowPath } from '../../../../domain/workflow/workflow-path';
export interface WorkflowStepView {
    id: string;
    name: {
        ar: string;
        en?: string;
    };
    description?: {
        ar: string;
        en?: string;
    };
    assigneeType: AssigneeType;
    assigneeRoleId?: string;
    assigneeDepartmentId?: string;
    defaultActionTypeId?: string;
    slaHours?: number;
    pausesSla: boolean;
    feeAmount?: number;
    feeCurrency?: string;
    allowedActionTypeIds: string[];
    dependsOnStepIds: string[];
}
export interface WorkflowPathView {
    id: string;
    templateId: string;
    name: {
        ar: string;
        en?: string;
    };
    description?: {
        ar: string;
        en?: string;
    };
    isActive: boolean;
    steps: WorkflowStepView[];
}
export declare function toWorkflowPathView(path: WorkflowPath): WorkflowPathView;
