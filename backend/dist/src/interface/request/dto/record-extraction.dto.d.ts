import { ExtractionFieldMeta } from '../../../application/request/commands/record-extraction/record-extraction.command';
export declare class RecordExtractionDto {
    filledData: Record<string, unknown>;
    abstained?: string[];
    extractionMeta?: Record<string, ExtractionFieldMeta>;
    modelVersion: string;
    nullThreshold?: number;
}
