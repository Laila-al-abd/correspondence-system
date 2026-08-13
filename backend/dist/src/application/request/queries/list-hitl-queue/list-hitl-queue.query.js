"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListHitlQueueQuery = void 0;
class ListHitlQueueQuery {
    limit;
    cursor;
    constructor(limit, cursor) {
        this.limit = limit;
        this.cursor = cursor;
    }
    static status = 'DRAFT';
    static classificationStatus = ['PENDING', 'HITL'];
}
exports.ListHitlQueueQuery = ListHitlQueueQuery;
//# sourceMappingURL=list-hitl-queue.query.js.map