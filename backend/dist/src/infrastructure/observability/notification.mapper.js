"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationMapper = void 0;
const notification_1 = require("../../domain/observability/notification");
const identifier_1 = require("../../domain/shared/identifier");
exports.NotificationMapper = {
    toDomain(row) {
        return notification_1.Notification.rehydrate(identifier_1.Identifier.of(row.id), {
            userId: identifier_1.Identifier.of(row.userId),
            requestId: row.requestId != null ? identifier_1.Identifier.of(row.requestId) : undefined,
            type: row.type,
            title: row.title,
            body: row.body ?? undefined,
            isRead: row.isRead,
            createdAt: row.createdAt,
        });
    },
    toPersistence(notification) {
        const s = notification.snapshot();
        return {
            id: notification.id.toString(),
            userId: s.userId,
            requestId: s.requestId ? s.requestId : null,
            type: s.type,
            title: s.title,
            body: s.body ?? null,
            isRead: s.isRead,
            createdAt: s.createdAt,
        };
    },
};
//# sourceMappingURL=notification.mapper.js.map