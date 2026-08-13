export interface ExtractionFieldMeta {
    raw?: string;
    charStart?: number;
    charEnd?: number;
    score?: number;
}
export interface RecordExtractionInput {
    requestId: string;
    filledData: Record<string, unknown>;
    abstained?: string[];
    extractionMeta?: Record<string, ExtractionFieldMeta>;
    modelVersion: string;
    nullThreshold?: number;
}
export declare class RecordExtractionCommand {
    readonly input: RecordExtractionInput;
    constructor(input: RecordExtractionInput);
}
