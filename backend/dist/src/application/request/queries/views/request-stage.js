"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveRequestStage = deriveRequestStage;
exports.stageOfRequest = stageOfRequest;
const enums_1 = require("../../../../domain/request/enums");
function deriveRequestStage(input) {
    if (input.currentStatus !== enums_1.RequestStatus.DRAFT)
        return input.currentStatus;
    switch (input.classificationStatus) {
        case enums_1.ClassificationStatus.HITL:
            return 'IN_HUMAN_REVIEW';
        case enums_1.ClassificationStatus.CLASSIFIED:
            return input.confirmedAt ? 'READY_TO_START' : 'AWAITING_CONFIRMATION';
        default:
            return 'AWAITING_CLASSIFICATION';
    }
}
function stageOfRequest(request) {
    return deriveRequestStage({
        currentStatus: request.status,
        classificationStatus: request.classificationStatus,
        confirmedAt: request.confirmedAt,
    });
}
//# sourceMappingURL=request-stage.js.map