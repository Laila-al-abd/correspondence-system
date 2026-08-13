"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListAssignedRequestsQuery = void 0;
class ListAssignedRequestsQuery {
    userId;
    limit;
    cursor;
    readyOnly;
    constructor(userId, limit, cursor, readyOnly) {
        this.userId = userId;
        this.limit = limit;
        this.cursor = cursor;
        this.readyOnly = readyOnly;
    }
}
exports.ListAssignedRequestsQuery = ListAssignedRequestsQuery;
//# sourceMappingURL=list-assigned-requests.query.js.map