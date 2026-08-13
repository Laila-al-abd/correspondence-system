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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurgeOldNotificationsHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const domain_error_1 = require("../../../../domain/shared/domain-error");
const tokens_1 = require("../../../tokens");
const purge_old_notifications_command_1 = require("./purge-old-notifications.command");
const MS_PER_DAY = 24 * 60 * 60 * 1000;
let PurgeOldNotificationsHandler = class PurgeOldNotificationsHandler {
    notifications;
    constructor(notifications) {
        this.notifications = notifications;
    }
    async execute({ retentionDays, }) {
        if (!Number.isFinite(retentionDays) || retentionDays < 1)
            throw new domain_error_1.InvariantViolationError('Retention must be at least one day.');
        const cutoff = new Date(Date.now() - retentionDays * MS_PER_DAY);
        const deleted = await this.notifications.deleteOlderThan(cutoff);
        return { deleted, retentionDays, cutoff: cutoff.toISOString() };
    }
};
exports.PurgeOldNotificationsHandler = PurgeOldNotificationsHandler;
exports.PurgeOldNotificationsHandler = PurgeOldNotificationsHandler = __decorate([
    (0, cqrs_1.CommandHandler)(purge_old_notifications_command_1.PurgeOldNotificationsCommand),
    __param(0, (0, common_1.Inject)(tokens_1.NOTIFICATION_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], PurgeOldNotificationsHandler);
//# sourceMappingURL=purge-old-notifications.handler.js.map