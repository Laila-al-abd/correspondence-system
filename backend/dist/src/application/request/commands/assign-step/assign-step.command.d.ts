export interface AssignStepInput {
    requestId: string;
    stepInstanceId: string;
    assigneeUserId: string;
}
export declare class AssignStepCommand {
    readonly input: AssignStepInput;
    constructor(input: AssignStepInput);
}
