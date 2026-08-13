export interface ClassifyRequestByHumanInput {
    requestId: string;
    templateId: string;
    filledData?: Record<string, unknown>;
}
export declare class ClassifyRequestByHumanCommand {
    readonly input: ClassifyRequestByHumanInput;
    constructor(input: ClassifyRequestByHumanInput);
}
