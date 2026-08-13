export interface OpenStepSla {
    requestId: string;
    stepInstanceId: string;
    slaDueAt: Date;
}
export interface SlaScanPort {
    findOpenStepsWithDeadline(limit: number): Promise<OpenStepSla[]>;
}
