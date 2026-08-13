export interface SubmitRequestInput {
    requesterId: string;
    rawText: string;
    filledData?: Record<string, unknown>;
}
export declare class SubmitRequestCommand {
    readonly input: SubmitRequestInput;
    constructor(input: SubmitRequestInput);
}
