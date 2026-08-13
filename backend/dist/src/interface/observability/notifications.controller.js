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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const throttler_1 = require("@nestjs/throttler");
const rxjs_1 = require("rxjs");
const tokens_1 = require("../../application/tokens");
const stream_ticket_service_1 = require("../../infrastructure/observability/stream-ticket.service");
const current_user_decorator_1 = require("../identity/current-user.decorator");
const permissions_decorator_1 = require("../identity/permissions.decorator");
const public_decorator_1 = require("../identity/public.decorator");
const list_my_notifications_query_1 = require("../../application/observability/queries/list-my-notifications/list-my-notifications.query");
const count_unread_notifications_query_1 = require("../../application/observability/queries/count-unread-notifications/count-unread-notifications.query");
const mark_notification_read_command_1 = require("../../application/observability/commands/mark-notification-read/mark-notification-read.command");
const mark_all_notifications_read_command_1 = require("../../application/observability/commands/mark-all-notifications-read/mark-all-notifications-read.command");
const purge_old_notifications_command_1 = require("../../application/observability/commands/purge-old-notifications/purge-old-notifications.command");
const list_notifications_dto_1 = require("./dto/list-notifications.dto");
const page_query_dto_1 = require("../shared/dto/page-query.dto");
const purge_notifications_dto_1 = require("./dto/purge-notifications.dto");
const DEFAULT_RETENTION_DAYS = 30;
const HEARTBEAT_MS = 30_000;
let NotificationsController = class NotificationsController {
    commandBus;
    queryBus;
    streamPort;
    tickets;
    constructor(commandBus, queryBus, streamPort, tickets) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.streamPort = streamPort;
        this.tickets = tickets;
    }
    list(userId, dto) {
        return this.queryBus.execute(new list_my_notifications_query_1.ListMyNotificationsQuery(userId, dto.unreadOnly === 'true', (0, page_query_dto_1.toNumber)(dto.limit), (0, page_query_dto_1.toNumber)(dto.offset)));
    }
    countUnread(userId) {
        return this.queryBus.execute(new count_unread_notifications_query_1.CountUnreadNotificationsQuery(userId));
    }
    stream(request) {
        const userId = this.authenticateByTicket(request);
        const notifications = this.notificationEvents(userId);
        const heartbeat = (0, rxjs_1.interval)(HEARTBEAT_MS).pipe((0, rxjs_1.map)(() => ({
            type: 'ping',
            data: { at: new Date().toISOString() },
        })));
        return (0, rxjs_1.merge)(notifications, heartbeat);
    }
    streamTicket(userId) {
        return this.tickets.issue(userId);
    }
    markAllRead(userId) {
        return this.commandBus.execute(new mark_all_notifications_read_command_1.MarkAllNotificationsReadCommand(userId));
    }
    purge(dto) {
        return this.commandBus.execute(new purge_old_notifications_command_1.PurgeOldNotificationsCommand(dto.retentionDays ?? DEFAULT_RETENTION_DAYS));
    }
    markRead(userId, id) {
        return this.commandBus.execute(new mark_notification_read_command_1.MarkNotificationReadCommand(id, userId));
    }
    notificationEvents(userId) {
        return this.streamPort
            .streamFor(userId)
            .pipe((0, rxjs_1.map)((event) => ({ type: 'notification', data: event })));
    }
    authenticateByTicket(request) {
        const raw = request.query?.['ticket'];
        const ticket = typeof raw === 'string' ? raw.trim() : '';
        if (ticket.length === 0)
            throw new common_1.UnauthorizedException('Provide a stream ticket as ?ticket=. Obtain one from POST /notifications/stream-ticket.');
        const userId = this.tickets.redeem(ticket);
        if (!userId)
            throw new common_1.UnauthorizedException('That stream ticket is expired or has already been used. Request a new one.');
        return userId;
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, list_notifications_dto_1.ListNotificationsDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "countUnread", null);
__decorate([
    (0, common_1.Sse)('stream'),
    (0, public_decorator_1.Public)(),
    (0, throttler_1.SkipThrottle)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", rxjs_1.Observable)
], NotificationsController.prototype, "stream", null);
__decorate([
    (0, common_1.Post)('stream-ticket'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], NotificationsController.prototype, "streamTicket", null);
__decorate([
    (0, common_1.Post)('read-all'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllRead", null);
__decorate([
    (0, common_1.Post)('purge'),
    (0, permissions_decorator_1.RequirePermissions)('user.manage'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purge_notifications_dto_1.PurgeNotificationsDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "purge", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markRead", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    __param(2, (0, common_1.Inject)(tokens_1.NOTIFICATION_STREAM)),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus, Object, stream_ticket_service_1.StreamTicketService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map