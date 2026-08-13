import { AssigneeType } from '../../../domain/workflow/enums';
declare class LocalizedTextDto {
    ar: string;
    en?: string;
}
declare class WorkflowStepDto {
    key: string;
    name: LocalizedTextDto;
    description?: LocalizedTextDto;
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
export declare class DefineWorkflowPathDto {
    templateId: string;
    name: LocalizedTextDto;
    description?: LocalizedTextDto;
    steps: WorkflowStepDto[];
    activate?: boolean;
}
export {};
