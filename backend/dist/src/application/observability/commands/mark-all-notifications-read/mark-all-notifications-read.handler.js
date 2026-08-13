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
exports.MarkAllNotificationsReadHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const mark_all_notifications_read_command_1 = require("./mark-all-notifications-read.command");
let MarkAllNotificationsReadHandler = class MarkAllNotificationsReadHandler {
    notifications;
    constructor(notifications) {
        this.notifications = notifications;
    }
    async execute({ userId, }) {
        const id = identifier_1.Identifier.of(userId);
        const marked = await this.notifications.countUnread(id);
        await this.notifications.markAllRead(id);
        return { marked };
    }
};
exports.MarkAllNotificationsReadHandler = MarkAllNotificationsReadHandler;
exports.MarkAllNotificationsReadHandler = MarkAllNotificationsReadHandler = __decorate([
    (0, cqrs_1.CommandHandler)(mark_all_notifications_read_command_1.MarkAllNotificationsReadCommand),
    __param(0, (0, common_1.Inject)(tokens_1.NOTIFICATION_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], MarkAllNotificationsReadHandler);
//# sourceMappingURL=mark-all-notifications-read.handler.js.map