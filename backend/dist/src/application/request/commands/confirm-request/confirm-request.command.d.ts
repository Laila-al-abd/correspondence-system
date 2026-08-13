export type ConfirmOutcome = 'CONFIRM' | 'DISPUTE';
export interface ConfirmRequestInput {
    requestId: string;
    actorId: string;
    outcome: ConfirmOutcome;
    filledData?: Record<string, unknown>;
}
export declare class ConfirmRequestCommand {
    readonly input: ConfirmRequestInput;
    constructor(input: ConfirmRequestInput);
}
