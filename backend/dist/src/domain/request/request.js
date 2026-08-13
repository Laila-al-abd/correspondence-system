"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const entity_1 = require("../shared/entity");
const domain_error_1 = require("../shared/domain-error");
const enums_1 = require("./enums");
const TRANSITIONS = {
    [enums_1.RequestStatus.DRAFT]: [enums_1.RequestStatus.IN_PROGRESS, enums_1.RequestStatus.CANCELLED],
    [enums_1.RequestStatus.IN_PROGRESS]: [
        enums_1.RequestStatus.ON_HOLD,
        enums_1.RequestStatus.COMPLETED,
        enums_1.RequestStatus.REJECTED,
        enums_1.RequestStatus.CANCELLED,
    ],
    [enums_1.RequestStatus.ON_HOLD]: [enums_1.RequestStatus.IN_PROGRESS, enums_1.RequestStatus.CANCELLED],
    [enums_1.RequestStatus.COMPLETED]: [],
    [enums_1.RequestStatus.REJECTED]: [],
    [enums_1.RequestStatus.CANCELLED]: [],
};
class Request extends entity_1.AggregateRoot {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        if (!p.rawText?.trim()) {
            throw new domain_error_1.InvariantViolationError('rawText is required and cannot be empty.');
        }
        if (p.rawText.length > 1000) {
            throw new domain_error_1.InvariantViolationError('rawText must be 1000 characters or fewer.');
        }
        return new Request(id, {
            requesterId: p.requesterId,
            referenceNo: p.referenceNo,
            rawText: p.rawText.trim(),
            filledData: {},
            classificationStatus: enums_1.ClassificationStatus.PENDING,
            currentStatus: enums_1.RequestStatus.DRAFT,
            priority: p.priority ?? enums_1.Priority.NORMAL,
            slaRisk: enums_1.SlaRisk.ON_TRACK,
            version: 0,
            stepInstances: [],
        });
    }
    static rehydrate(id, props) {
        return new Request(id, props);
    }
    classifyByModel(templateId, confidence, threshold = 0.8, templateDefaultPriority) {
        if (this.props.currentStatus !== enums_1.RequestStatus.DRAFT)
            throw new domain_error_1.InvariantViolationError("Only draft requests can be classified.");
        this.props.templateId = templateId;
        this.props.classificationConfidence = confidence;
        this.props.classifiedBy = enums_1.ClassifiedBy.NLP;
        const trusted = confidence >= threshold;
        this.props.classificationStatus =
            trusted ? enums_1.ClassificationStatus.CLASSIFIED : enums_1.ClassificationStatus.HITL;
        if (templateDefaultPriority)
            this.props.priority = templateDefaultPriority;
    }
    classifyByHuman(templateId, templateDefaultPriority) {
        if (this.props.currentStatus !== enums_1.RequestStatus.DRAFT)
            throw new domain_error_1.InvariantViolationError("Only draft requests can be classified.");
        if (this.props.classificationStatus === enums_1.ClassificationStatus.CLASSIFIED)
            throw new domain_error_1.InvariantViolationError("This request is already classified; a reviewer cannot reclassify it.");
        this.props.templateId = templateId;
        this.props.classifiedBy = enums_1.ClassifiedBy.HITL;
        this.props.classificationStatus = enums_1.ClassificationStatus.CLASSIFIED;
        if (templateDefaultPriority)
            this.props.priority = templateDefaultPriority;
    }
    flagForHumanClassification() {
        if (this.props.currentStatus !== enums_1.RequestStatus.DRAFT)
            throw new domain_error_1.InvariantViolationError("Only a draft request can be sent for human classification.");
        if (this.props.classificationStatus === enums_1.ClassificationStatus.CLASSIFIED)
            throw new domain_error_1.InvariantViolationError("This request is already classified; it does not need a reviewer.");
        this.props.classificationStatus = enums_1.ClassificationStatus.HITL;
    }
    setFilledData(data) {
        if (this.props.currentStatus !== enums_1.RequestStatus.DRAFT)
            throw new domain_error_1.InvariantViolationError("Form data can only change while the request is a draft.");
        this.props.filledData = data;
    }
    applyExtractedFields(patch) {
        if (this.props.currentStatus !== enums_1.RequestStatus.DRAFT)
            throw new domain_error_1.InvariantViolationError("Form data can only change while the request is a draft.");
        if (this.props.classificationStatus !== enums_1.ClassificationStatus.CLASSIFIED)
            throw new domain_error_1.InvariantViolationError("Only a classified request accepts extracted field values.");
        this.props.filledData = { ...this.props.filledData, ...patch };
    }
    clearFilledData() {
        this.props.filledData = {};
    }
    markExtractionAttempted() {
        this.props.extractionAttemptedAt = new Date();
    }
    get extractionAttemptedAt() { return this.props.extractionAttemptedAt; }
    applyRequesterValues(patch) {
        this.applyExtractedFields(patch);
    }
    confirm() {
        if (this.props.currentStatus !== enums_1.RequestStatus.DRAFT)
            throw new domain_error_1.InvariantViolationError("Only a draft request can be confirmed.");
        if (this.props.classificationStatus !== enums_1.ClassificationStatus.CLASSIFIED)
            throw new domain_error_1.InvariantViolationError("There is nothing to confirm until the request has been classified.");
        this.props.confirmedAt = new Date();
    }
    dispute() {
        if (this.props.currentStatus !== enums_1.RequestStatus.DRAFT)
            throw new domain_error_1.InvariantViolationError("Only a draft request can be disputed.");
        this.props.classificationStatus = enums_1.ClassificationStatus.HITL;
        this.props.confirmedAt = undefined;
        this.clearFilledData();
    }
    changePriority(priority) { this.props.priority = priority; }
    markAtRisk() { this.props.slaRisk = enums_1.SlaRisk.AT_RISK; }
    markBreached() { this.props.slaRisk = enums_1.SlaRisk.BREACHED; }
    clearSlaRisk() { this.props.slaRisk = enums_1.SlaRisk.ON_TRACK; }
    startWorkflow(workflowPathId, stepInstances) {
        if (this.props.classificationStatus !== enums_1.ClassificationStatus.CLASSIFIED)
            throw new domain_error_1.InvariantViolationError("Cannot start a workflow before the request is classified.");
        if (!this.props.templateId)
            throw new domain_error_1.InvariantViolationError("Cannot start a workflow without a template.");
        if (!this.props.confirmedAt)
            throw new domain_error_1.InvariantViolationError("Cannot start a workflow before the requester confirms the template and the extracted values.");
        if (stepInstances.length === 0)
            throw new domain_error_1.InvariantViolationError("A workflow must have at least one step.");
        const foreign = stepInstances.find((si) => si.snapshot().requestId !== this.id.toString());
        if (foreign)
            throw new domain_error_1.InvariantViolationError(`Step instance "${foreign.id.toString()}" belongs to another request and cannot be attached here.`);
        this.props.workflowPathId = workflowPathId;
        this.props.stepInstances = stepInstances;
        this.transitionTo(enums_1.RequestStatus.IN_PROGRESS);
    }
    readySteps(dependencyMap) {
        const satisfied = new Set(this.props.stepInstances
            .filter((si) => si.isDone() || si.status === enums_1.StepInstanceStatus.SKIPPED)
            .map((si) => si.workflowStepId.toString()));
        return this.props.stepInstances.filter((si) => {
            if (si.status !== enums_1.StepInstanceStatus.PENDING)
                return false;
            const deps = dependencyMap.get(si.workflowStepId.toString()) ?? [];
            return deps.every((d) => satisfied.has(d));
        });
    }
    complete() {
        if (this.props.stepInstances.length === 0)
            throw new domain_error_1.InvariantViolationError("Cannot complete a request that has not started a workflow.");
        if (!this.props.stepInstances.every((si) => si.isTerminal()))
            throw new domain_error_1.InvariantViolationError("Cannot complete a request with unfinished steps.");
        this.transitionTo(enums_1.RequestStatus.COMPLETED);
        this.props.completedAt = new Date();
    }
    recordBusinessDuration(minutes) {
        if (this.props.currentStatus !== enums_1.RequestStatus.COMPLETED)
            throw new domain_error_1.InvariantViolationError("Only a completed request has a duration to record.");
        this.props.businessDurationMinutes = Math.max(0, Math.round(minutes));
    }
    reject() {
        this.transitionTo(enums_1.RequestStatus.REJECTED);
        this.props.completedAt = new Date();
    }
    hold() { this.transitionTo(enums_1.RequestStatus.ON_HOLD); }
    resume() { this.transitionTo(enums_1.RequestStatus.IN_PROGRESS); }
    cancel() {
        this.transitionTo(enums_1.RequestStatus.CANCELLED);
        this.props.completedAt = new Date();
    }
    transitionTo(next) {
        if (!TRANSITIONS[this.props.currentStatus].includes(next))
            throw new domain_error_1.InvariantViolationError(`Illegal transition ${this.props.currentStatus} -> ${next}.`);
        this.props.currentStatus = next;
    }
    get referenceNo() { return this.props.referenceNo; }
    get status() { return this.props.currentStatus; }
    get classificationStatus() { return this.props.classificationStatus; }
    get templateId() { return this.props.templateId; }
    get workflowPathId() { return this.props.workflowPathId; }
    get requesterId() { return this.props.requesterId; }
    get filledData() { return this.props.filledData; }
    get version() { return this.props.version; }
    get priority() { return this.props.priority; }
    get slaRisk() { return this.props.slaRisk; }
    get slaDueAt() { return this.props.slaDueAt; }
    get confirmedAt() { return this.props.confirmedAt; }
    get completedAt() { return this.props.completedAt; }
    get createdAt() { return this.props.createdAt; }
    get businessDurationMinutes() {
        return this.props.businessDurationMinutes;
    }
    get stepInstances() { return this.props.stepInstances; }
    snapshot() {
        return {
            requesterId: this.props.requesterId.toString(),
            referenceNo: this.props.referenceNo,
            rawText: this.props.rawText,
            templateId: this.props.templateId?.toString(),
            workflowPathId: this.props.workflowPathId?.toString(),
            filledData: this.props.filledData,
            classificationStatus: this.props.classificationStatus,
            classificationConfidence: this.props.classificationConfidence,
            classifiedBy: this.props.classifiedBy,
            currentStatus: this.props.currentStatus,
            priority: this.props.priority,
            slaRisk: this.props.slaRisk,
            slaDueAt: this.props.slaDueAt,
            completedAt: this.props.completedAt,
            confirmedAt: this.props.confirmedAt,
            extractionAttemptedAt: this.props.extractionAttemptedAt,
            businessDurationMinutes: this.props.businessDurationMinutes,
            version: this.props.version,
            stepInstances: this.props.stepInstances.map((si) => si.snapshot()),
        };
    }
    static compareForQueue(a, b) {
        const byPriority = enums_1.PRIORITY_RANK[b.props.priority] - enums_1.PRIORITY_RANK[a.props.priority];
        if (byPriority !== 0)
            return byPriority;
        const byRisk = enums_1.SLA_RISK_RANK[b.props.slaRisk] - enums_1.SLA_RISK_RANK[a.props.slaRisk];
        if (byRisk !== 0)
            return byRisk;
        const aDue = a.props.slaDueAt?.getTime() ?? Number.POSITIVE_INFINITY;
        const bDue = b.props.slaDueAt?.getTime() ?? Number.POSITIVE_INFINITY;
        return aDue - bDue;
    }
}
exports.Request = Request;
//# sourceMappingURL=request.js.map