"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListRequestQueueQuery = void 0;
class ListRequestQueueQuery {
    status;
    limit;
    cursor;
    classificationStatus;
    hasFilledData;
    extracted;
    constructor(status, limit, cursor, classificationStatus, hasFilledData, extracted) {
        this.status = status;
        this.limit = limit;
        this.cursor = cursor;
        this.classificationStatus = classificationStatus;
        this.hasFilledData = hasFilledData;
        this.extracted = extracted;
    }
}
exports.ListRequestQueueQuery = ListRequestQueueQuery;
//# sourceMappingURL=list-request-queue.query.js.map