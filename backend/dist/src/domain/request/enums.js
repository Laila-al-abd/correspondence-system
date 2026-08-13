"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLA_RISK_RANK = exports.PRIORITY_RANK = exports.SlaRisk = exports.DocKind = exports.PaymentStatus = exports.Priority = exports.StepInstanceStatus = exports.RequestStatus = exports.ClassifiedBy = exports.ClassificationStatus = void 0;
var ClassificationStatus;
(function (ClassificationStatus) {
    ClassificationStatus["PENDING"] = "PENDING";
    ClassificationStatus["CLASSIFIED"] = "CLASSIFIED";
    ClassificationStatus["HITL"] = "HITL";
})(ClassificationStatus || (exports.ClassificationStatus = ClassificationStatus = {}));
var ClassifiedBy;
(function (ClassifiedBy) {
    ClassifiedBy["NLP"] = "NLP";
    ClassifiedBy["HITL"] = "HITL";
})(ClassifiedBy || (exports.ClassifiedBy = ClassifiedBy = {}));
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["DRAFT"] = "DRAFT";
    RequestStatus["IN_PROGRESS"] = "IN_PROGRESS";
    RequestStatus["ON_HOLD"] = "ON_HOLD";
    RequestStatus["COMPLETED"] = "COMPLETED";
    RequestStatus["REJECTED"] = "REJECTED";
    RequestStatus["CANCELLED"] = "CANCELLED";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
var StepInstanceStatus;
(function (StepInstanceStatus) {
    StepInstanceStatus["PENDING"] = "PENDING";
    StepInstanceStatus["IN_PROGRESS"] = "IN_PROGRESS";
    StepInstanceStatus["WAITING"] = "WAITING";
    StepInstanceStatus["DONE"] = "DONE";
    StepInstanceStatus["SKIPPED"] = "SKIPPED";
    StepInstanceStatus["REJECTED"] = "REJECTED";
})(StepInstanceStatus || (exports.StepInstanceStatus = StepInstanceStatus = {}));
var Priority;
(function (Priority) {
    Priority["LOW"] = "LOW";
    Priority["NORMAL"] = "NORMAL";
    Priority["HIGH"] = "HIGH";
    Priority["URGENT"] = "URGENT";
})(Priority || (exports.Priority = Priority = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["REQUIRED"] = "REQUIRED";
    PaymentStatus["CONFIRMED"] = "CONFIRMED";
    PaymentStatus["WAIVED"] = "WAIVED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var DocKind;
(function (DocKind) {
    DocKind["UPLOADED"] = "UPLOADED";
    DocKind["GENERATED"] = "GENERATED";
})(DocKind || (exports.DocKind = DocKind = {}));
var SlaRisk;
(function (SlaRisk) {
    SlaRisk["ON_TRACK"] = "ON_TRACK";
    SlaRisk["AT_RISK"] = "AT_RISK";
    SlaRisk["BREACHED"] = "BREACHED";
})(SlaRisk || (exports.SlaRisk = SlaRisk = {}));
exports.PRIORITY_RANK = {
    [Priority.LOW]: 0,
    [Priority.NORMAL]: 1,
    [Priority.HIGH]: 2,
    [Priority.URGENT]: 3,
};
exports.SLA_RISK_RANK = {
    [SlaRisk.ON_TRACK]: 0,
    [SlaRisk.AT_RISK]: 1,
    [SlaRisk.BREACHED]: 2,
};
//# sourceMappingURL=enums.js.map