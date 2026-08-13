export declare enum StepActionKind {
    START = "START",
    COMPLETE = "COMPLETE",
    REJECT = "REJECT",
    SKIP = "SKIP"
}
export interface ActOnStepInput {
    requestId: string;
    stepInstanceId: string;
    actorId: string;
    action: StepActionKind;
    actionTypeId?: string;
    comment?: string;
}
export declare class ActOnStepCommand {
    readonly input: ActOnStepInput;
    constructor(input: ActOnStepInput);
}
