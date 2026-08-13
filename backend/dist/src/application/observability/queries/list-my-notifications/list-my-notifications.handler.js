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
exports.ListMyNotificationsHandler = void 0;
exports.toNotificationView = toNotificationView;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const pagination_1 = require("../../../shared/pagination");
const list_my_notifications_query_1 = require("./list-my-notifications.query");
let ListMyNotificationsHandler = class ListMyNotificationsHandler {
    notifications;
    constructor(notifications) {
        this.notifications = notifications;
    }
    async execute(query) {
        const limit = (0, pagination_1.clampLimit)(query.limit);
        const offset = (0, pagination_1.clampOffset)(query.offset);
        const { rows, total } = await this.notifications.pageForUser(identifier_1.Identifier.of(query.userId), { onlyUnread: query.onlyUnread, limit, offset });
        return {
            total,
            limit,
            offset,
            items: rows.map((row) => toNotificationView(row)),
        };
    }
};
exports.ListMyNotificationsHandler = ListMyNotificationsHandler;
exports.ListMyNotificationsHandler = ListMyNotificationsHandler = __decorate([
    (0, cqrs_1.QueryHandler)(list_my_notifications_query_1.ListMyNotificationsQuery),
    __param(0, (0, common_1.Inject)(tokens_1.NOTIFICATION_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ListMyNotificationsHandler);
function toNotificationView(notification) {
    const snapshot = notification.snapshot();
    return {
        id: notification.id.toString(),
        type: snapshot.type,
        title: snapshot.title,
        body: snapshot.body ?? null,
        requestId: snapshot.requestId ?? null,
        isRead: snapshot.isRead,
        createdAt: snapshot.createdAt.toISOString(),
    };
}
//# sourceMappingURL=list-my-notifications.handler.js.map