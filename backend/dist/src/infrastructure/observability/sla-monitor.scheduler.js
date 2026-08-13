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
var SlaMonitorScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlaMonitorScheduler = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sla_monitor_service_1 = require("../../application/observability/services/sla-monitor.service");
const request_context_1 = require("../shared/request-context");
const system_actor_1 = require("../shared/system-actor");
const MS_PER_MINUTE = 60 * 1000;
const DEFAULT_SWEEP_MINUTES = 15;
const STARTUP_DELAY_MS = 15_000;
let SlaMonitorScheduler = SlaMonitorScheduler_1 = class SlaMonitorScheduler {
    monitor;
    config;
    logger = new common_1.Logger(SlaMonitorScheduler_1.name);
    startupTimer;
    sweepTimer;
    running = false;
    constructor(monitor, config) {
        this.monitor = monitor;
        this.config = config;
    }
    onModuleInit() {
        const sweepMinutes = this.sweepMinutes();
        this.startupTimer = setTimeout(() => {
            void this.sweep();
        }, STARTUP_DELAY_MS);
        this.startupTimer.unref?.();
        this.sweepTimer = setInterval(() => {
            void this.sweep();
        }, sweepMinutes * MS_PER_MINUTE);
        this.sweepTimer.unref?.();
        this.logger.log(`SLA monitor active: sweeping every ${sweepMinutes}m.`);
    }
    onModuleDestroy() {
        if (this.startupTimer)
            clearTimeout(this.startupTimer);
        if (this.sweepTimer)
            clearInterval(this.sweepTimer);
    }
    async sweep() {
        if (this.running) {
            this.logger.warn('Skipping this SLA sweep: the previous one is still running.');
            return;
        }
        this.running = true;
        try {
            await request_context_1.RequestContextStore.run({ userId: system_actor_1.SYSTEM_USER_ID }, async () => {
                const result = await this.monitor.sweep();
                if (result.requestsChanged > 0)
                    this.logger.log(`SLA sweep: ${result.scannedSteps} open step(s) checked, ` +
                        `${result.requestsChanged} request(s) updated ` +
                        `(${result.breached} breached, ${result.atRisk} at risk, ${result.onTrack} on track).`);
            });
        }
        catch (error) {
            this.logger.warn(`SLA sweep failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        finally {
            this.running = false;
        }
    }
    sweepMinutes() {
        const raw = this.config.get('SLA_SWEEP_MINUTES');
        const value = raw === undefined ? Number.NaN : Number(raw);
        return Number.isFinite(value) && value > 0 ? value : DEFAULT_SWEEP_MINUTES;
    }
};
exports.SlaMonitorScheduler = SlaMonitorScheduler;
exports.SlaMonitorScheduler = SlaMonitorScheduler = SlaMonitorScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sla_monitor_service_1.SlaMonitorService,
        config_1.ConfigService])
], SlaMonitorScheduler);
//# sourceMappingURL=sla-monitor.scheduler.js.map