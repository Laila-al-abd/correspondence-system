import { AssigneeType } from '../../../../domain/workflow/enums';
export interface WorkflowStepInput {
    key: string;
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
    pausesSla?: boolean;
    feeAmount?: number;
    feeCurrency?: string;
    allowedActionTypeIds?: string[];
    dependsOn?: string[];
}
export interface DefineWorkflowPathInput {
    templateId: string;
    name: {
        ar: string;
        en?: string;
    };
    description?: {
        ar: string;
        en?: string;
    };
    steps: WorkflowStepInput[];
    activate?: boolean;
}
export declare class DefineWorkflowPathCommand {
    readonly input: DefineWorkflowPathInput;
    constructor(input: DefineWorkflowPathInput);
}
