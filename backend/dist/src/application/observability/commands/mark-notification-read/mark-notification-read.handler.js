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
exports.MarkNotificationReadHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const list_my_notifications_handler_1 = require("../../queries/list-my-notifications/list-my-notifications.handler");
const mark_notification_read_command_1 = require("./mark-notification-read.command");
let MarkNotificationReadHandler = class MarkNotificationReadHandler {
    notifications;
    constructor(notifications) {
        this.notifications = notifications;
    }
    async execute({ notificationId, userId, }) {
        const notification = await this.notifications.findById(identifier_1.Identifier.of(notificationId));
        if (!notification)
            throw new errors_1.EntityNotFoundError('Notification', notificationId);
        if (notification.userId.toString() !== userId)
            throw new errors_1.ForbiddenActionError('You can only read your own notifications.');
        notification.markRead();
        await this.notifications.save(notification);
        return (0, list_my_notifications_handler_1.toNotificationView)(notification);
    }
};
exports.MarkNotificationReadHandler = MarkNotificationReadHandler;
exports.MarkNotificationReadHandler = MarkNotificationReadHandler = __decorate([
    (0, cqrs_1.CommandHandler)(mark_notification_read_command_1.MarkNotificationReadCommand),
    __param(0, (0, common_1.Inject)(tokens_1.NOTIFICATION_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], MarkNotificationReadHandler);
//# sourceMappingURL=mark-notification-read.handler.js.map