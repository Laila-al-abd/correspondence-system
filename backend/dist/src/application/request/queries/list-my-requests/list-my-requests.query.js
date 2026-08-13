"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListMyRequestsQuery = void 0;
class ListMyRequestsQuery {
    requesterId;
    limit;
    cursor;
    constructor(requesterId, limit, cursor) {
        this.requesterId = requesterId;
        this.limit = limit;
        this.cursor = cursor;
    }
}
exports.ListMyRequestsQuery = ListMyRequestsQuery;
//# sourceMappingURL=list-my-requests.query.js.map