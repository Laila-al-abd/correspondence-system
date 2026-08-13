import { Entity } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { LocalizedText } from "../shared/localized-text";
import { AssigneeType } from "./enums";
interface WorkflowStepProps {
    name: LocalizedText;
    description?: LocalizedText;
    assigneeType: AssigneeType;
    assigneeRoleId?: Identifier;
    assigneeDepartmentId?: Identifier;
    defaultActionTypeId?: Identifier;
    slaHours?: number;
    pausesSla: boolean;
    feeAmount?: number;
    feeCurrency?: string;
    allowedActionTypeIds: Set<string>;
    dependsOnStepIds: Set<string>;
}
export declare class WorkflowStep extends Entity {
    private props;
    private constructor();
    static create(id: Identifier, p: {
        name: LocalizedText;
        assigneeType: AssigneeType;
        description?: LocalizedText;
        assigneeRoleId?: Identifier;
        assigneeDepartmentId?: Identifier;
        defaultActionTypeId?: Identifier;
        slaHours?: number;
        pausesSla?: boolean;
        feeAmount?: number;
        feeCurrency?: string;
    }): WorkflowStep;
    static rehydrate(id: Identifier, props: WorkflowStepProps): WorkflowStep;
    private static assertAssigneeConsistent;
    allowAction(actionTypeId: Identifier): void;
    dependOn(stepId: Identifier): void;
    permits(actionTypeId: Identifier): boolean;
    get dependencyIds(): string[];
    get assigneeType(): AssigneeType;
    get slaHours(): number | undefined;
    get pausesSla(): boolean;
    get fee(): {
        amount: number;
        currency: string;
    } | undefined;
    chargesFee(): boolean;
    snapshot(): {
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
    };
}
export {};
