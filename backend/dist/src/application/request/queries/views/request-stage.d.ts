export type RequestStage = 'AWAITING_CLASSIFICATION' | 'IN_HUMAN_REVIEW' | 'AWAITING_CONFIRMATION' | 'READY_TO_START' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
export interface RequestStageInput {
    currentStatus: string;
    classificationStatus: string;
    confirmedAt?: Date | string | null;
}
export declare function deriveRequestStage(input: RequestStageInput): RequestStage;
export declare function stageOfRequest(request: {
    status: string;
    classificationStatus: string;
    confirmedAt?: Date;
}): RequestStage;
