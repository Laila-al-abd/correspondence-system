export interface ClassifyRequestByModelInput {
    requestId: string;
    templateId: string;
    confidence: number;
    threshold?: number;
    modelVersion?: string;
}
export declare class ClassifyRequestByModelCommand {
    readonly input: ClassifyRequestByModelInput;
    constructor(input: ClassifyRequestByModelInput);
}
