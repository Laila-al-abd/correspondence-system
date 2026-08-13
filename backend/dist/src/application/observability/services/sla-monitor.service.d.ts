import type { MlPredictionRepository } from '../../../domain/observability/ports/ml-prediction.repository';
import type { SystemSettingRepository } from '../../../domain/observability/ports/system-setting.repository';
import type { RequestRepository } from '../../../domain/request/ports/request.repository';
import type { IdGenerator } from '../../../domain/shared/id-generator';
import type { SlaScanPort } from '../ports/sla-scan.port';
import { BusinessHoursService } from './business-hours.service';
export declare const SLA_THRESHOLD_SETTING_KEY = "sla_thresholds";
export declare const DEFAULT_SCAN_LIMIT = 500;
export declare const BASELINE_MODEL_VERSION = "baseline-rule-v1";
export interface SlaSweepResult {
    scannedSteps: number;
    requestsChanged: number;
    breached: number;
    atRisk: number;
    onTrack: number;
}
export declare class SlaMonitorService {
    private readonly scan;
    private readonly requests;
    private readonly settings;
    private readonly predictions;
    private readonly ids;
    private readonly businessHours;
    private readonly logger;
    constructor(scan: SlaScanPort, requests: RequestRepository, settings: SystemSettingRepository, predictions: MlPredictionRepository, ids: IdGenerator, businessHours: BusinessHoursService);
    sweep(): Promise<SlaSweepResult>;
    private applyTo;
    private record;
    private atRiskHours;
}
