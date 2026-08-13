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
var NotificationRetentionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRetentionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cqrs_1 = require("@nestjs/cqrs");
const purge_old_notifications_command_1 = require("../../application/observability/commands/purge-old-notifications/purge-old-notifications.command");
const request_context_1 = require("../shared/request-context");
const system_actor_1 = require("../shared/system-actor");
const MS_PER_HOUR = 60 * 60 * 1000;
const DEFAULT_RETENTION_DAYS = 30;
const DEFAULT_SWEEP_HOURS = 24;
const STARTUP_DELAY_MS = 10_000;
let NotificationRetentionService = NotificationRetentionService_1 = class NotificationRetentionService {
    commandBus;
    config;
    logger = new common_1.Logger(NotificationRetentionService_1.name);
    startupTimer;
    sweepTimer;
    constructor(commandBus, config) {
        this.commandBus = commandBus;
        this.config = config;
    }
    onModuleInit() {
        const sweepHours = this.readPositiveNumber('NOTIFICATION_RETENTION_SWEEP_HOURS', DEFAULT_SWEEP_HOURS);
        this.startupTimer = setTimeout(() => {
            void this.sweep();
        }, STARTUP_DELAY_MS);
        this.startupTimer.unref?.();
        this.sweepTimer = setInterval(() => {
            void this.sweep();
        }, sweepHours * MS_PER_HOUR);
        this.sweepTimer.unref?.();
        this.logger.log(`Notification retention active: keeping ${this.retentionDays()} days, sweeping every ${sweepHours}h.`);
    }
    onModuleDestroy() {
        if (this.startupTimer)
            clearTimeout(this.startupTimer);
        if (this.sweepTimer)
            clearInterval(this.sweepTimer);
    }
    async sweep() {
        await request_context_1.RequestContextStore.run({ userId: system_actor_1.SYSTEM_USER_ID }, async () => {
            try {
                const result = (await this.commandBus.execute(new purge_old_notifications_command_1.PurgeOldNotificationsCommand(this.retentionDays())));
                if (result.deleted > 0)
                    this.logger.log(`Removed ${result.deleted} notification(s) created before ${result.cutoff}.`);
            }
            catch (error) {
                this.logger.warn(`Notification retention sweep failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    retentionDays() {
        return this.readPositiveNumber('NOTIFICATION_RETENTION_DAYS', DEFAULT_RETENTION_DAYS);
    }
    readPositiveNumber(key, fallback) {
        const raw = this.config.get(key);
        const value = raw === undefined ? Number.NaN : Number(raw);
        return Number.isFinite(value) && value > 0 ? value : fallback;
    }
};
exports.NotificationRetentionService = NotificationRetentionService;
exports.NotificationRetentionService = NotificationRetentionService = NotificationRetentionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        config_1.ConfigService])
], NotificationRetentionService);
//# sourceMappingURL=notification-retention.service.js.map