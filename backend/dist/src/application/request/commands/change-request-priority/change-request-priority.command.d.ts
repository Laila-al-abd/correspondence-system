export interface ChangeRequestPriorityInput {
    requestId: string;
    actorId: string;
    priority: string;
    reason: string;
}
export declare class ChangeRequestPriorityCommand {
    readonly input: ChangeRequestPriorityInput;
    constructor(input: ChangeRequestPriorityInput);
}
