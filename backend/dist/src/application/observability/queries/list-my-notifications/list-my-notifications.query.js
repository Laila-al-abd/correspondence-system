"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListMyNotificationsQuery = void 0;
class ListMyNotificationsQuery {
    userId;
    onlyUnread;
    limit;
    offset;
    constructor(userId, onlyUnread = false, limit, offset) {
        this.userId = userId;
        this.onlyUnread = onlyUnread;
        this.limit = limit;
        this.offset = offset;
    }
}
exports.ListMyNotificationsQuery = ListMyNotificationsQuery;
//# sourceMappingURL=list-my-notifications.query.js.map