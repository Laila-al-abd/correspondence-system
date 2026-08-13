"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SlaMonitorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlaMonitorService = exports.BASELINE_MODEL_VERSION = exports.DEFAULT_SCAN_LIMIT = exports.SLA_THRESHOLD_SETTING_KEY = void 0;
const common_1 = require("@nestjs/common");
const ml_prediction_1 = require("../../../domain/observability/ml-prediction");
const enums_1 = require("../../../domain/observability/enums");
const enums_2 = require("../../../domain/request/enums");
const identifier_1 = require("../../../domain/shared/identifier");
const tokens_1 = require("../../tokens");
const business_hours_service_1 = require("./business-hours.service");
exports.SLA_THRESHOLD_SETTING_KEY = 'sla_thresholds';
const DEFAULT_AT_RISK_HOURS = 8;
exports.DEFAULT_SCAN_LIMIT = 500;
exports.BASELINE_MODEL_VERSION = 'baseline-rule-v1';
let SlaMonitorService = SlaMonitorService_1 = class SlaMonitorService {
    scan;
    requests;
    settings;
    predictions;
    ids;
    businessHours;
    logger = new common_1.Logger(SlaMonitorService_1.name);
    constructor(scan, requests, settings, predictions, ids, businessHours) {
        this.scan = scan;
        this.requests = requests;
        this.settings = settings;
        this.predictions = predictions;
        this.ids = ids;
        this.businessHours = businessHours;
    }
    async sweep() {
        const now = new Date();
        const atRiskHours = await this.atRiskHours();
        const steps = await this.scan.findOpenStepsWithDeadline(exports.DEFAULT_SCAN_LIMIT);
        const verdicts = new Map();
        for (const step of steps) {
            const overdue = step.slaDueAt.getTime() <= now.getTime();
            const remainingHours = overdue
                ? -(await this.businessHours.workingHoursBetween(step.slaDueAt, now))
                : await this.businessHours.workingHoursBetween(now, step.slaDueAt);
            const risk = overdue
                ? enums_2.SlaRisk.BREACHED
                : remainingHours <= atRiskHours
                    ? enums_2.SlaRisk.AT_RISK
                    : enums_2.SlaRisk.ON_TRACK;
            const previous = verdicts.get(step.requestId);
            verdicts.set(step.requestId, {
                risk: previous === undefined ||
                    enums_2.SLA_RISK_RANK[risk] > enums_2.SLA_RISK_RANK[previous.risk]
                    ? risk
                    : previous.risk,
                remainingHours: previous === undefined
                    ? remainingHours
                    : Math.min(remainingHours, previous.remainingHours),
            });
        }
        const result = {
            scannedSteps: steps.length,
            requestsChanged: 0,
            breached: 0,
            atRisk: 0,
            onTrack: 0,
        };
        for (const [requestId, verdict] of verdicts) {
            if (verdict.risk === enums_2.SlaRisk.BREACHED)
                result.breached++;
            else if (verdict.risk === enums_2.SlaRisk.AT_RISK)
                result.atRisk++;
            else
                result.onTrack++;
            if (await this.applyTo(requestId, verdict, atRiskHours))
                result.requestsChanged++;
        }
        return result;
    }
    async applyTo(requestId, verdict, atRiskHours) {
        try {
            const request = await this.requests.findById(identifier_1.Identifier.of(requestId));
            if (!request)
                return false;
            if (request.slaRisk === verdict.risk)
                return false;
            if (verdict.risk === enums_2.SlaRisk.BREACHED)
                request.markBreached();
            else if (verdict.risk === enums_2.SlaRisk.AT_RISK)
                request.markAtRisk();
            else
                request.clearSlaRisk();
            await this.requests.save(request);
            await this.record(requestId, verdict, atRiskHours);
            return true;
        }
        catch (error) {
            this.logger.warn(`Could not update the SLA risk of request ${requestId}: ${describe(error)}`);
            return false;
        }
    }
    async record(requestId, verdict, atRiskHours) {
        try {
            await this.predictions.save(ml_prediction_1.MlPrediction.create(this.ids.next(), {
                requestId: identifier_1.Identifier.of(requestId),
                modelType: enums_1.ModelType.SLA_RISK_BASELINE,
                modelVersion: exports.BASELINE_MODEL_VERSION,
                predictedValue: {
                    risk: verdict.risk,
                    remainingBusinessHours: round(verdict.remainingHours),
                    atRiskThresholdHours: atRiskHours,
                    basis: 'business-hours-countdown',
                },
            }));
        }
        catch (error) {
            this.logger.warn(`Could not record the SLA baseline for request ${requestId}: ${describe(error)}`);
        }
    }
    async atRiskHours() {
        try {
            const setting = await this.settings.findByKey(exports.SLA_THRESHOLD_SETTING_KEY);
            const value = setting?.value;
            if (value && typeof value === 'object') {
                const raw = value.atRiskHours;
                const hours = Number(raw);
                if (Number.isFinite(hours) && hours > 0)
                    return hours;
            }
        }
        catch (error) {
            this.logger.warn(`Could not read ${exports.SLA_THRESHOLD_SETTING_KEY}, using the default: ${describe(error)}`);
        }
        return DEFAULT_AT_RISK_HOURS;
    }
};
exports.SlaMonitorService = SlaMonitorService;
exports.SlaMonitorService = SlaMonitorService = SlaMonitorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tokens_1.SLA_SCAN)),
    __param(1, (0, common_1.Inject)(tokens_1.REQUEST_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.SYSTEM_SETTING_REPOSITORY)),
    __param(3, (0, common_1.Inject)(tokens_1.ML_PREDICTION_REPOSITORY)),
    __param(4, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, business_hours_service_1.BusinessHoursService])
], SlaMonitorService);
function round(hours) {
    return Math.round(hours * 100) / 100;
}
function describe(error) {
    return error instanceof Error ? error.message : String(error);
}
//# sourceMappingURL=sla-monitor.service.js.map