import { StepActionKind } from '../../../application/request/commands/act-on-step/act-on-step.command';
export declare class ActOnStepDto {
    action: StepActionKind;
    actionTypeId?: string;
    comment?: string;
}
