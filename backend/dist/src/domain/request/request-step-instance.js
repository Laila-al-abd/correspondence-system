"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestStepInstance = void 0;
const entity_1 = require("../shared/entity");
const domain_error_1 = require("../shared/domain-error");
const enums_1 = require("./enums");
const TERMINAL = [
    enums_1.StepInstanceStatus.DONE,
    enums_1.StepInstanceStatus.SKIPPED,
    enums_1.StepInstanceStatus.REJECTED,
];
class RequestStepInstance extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        return new RequestStepInstance(id, {
            requestId: p.requestId,
            workflowStepId: p.workflowStepId,
            status: enums_1.StepInstanceStatus.PENDING,
            slaDueAt: p.slaDueAt,
            slaPaused: false,
        });
    }
    static rehydrate(id, props) {
        return new RequestStepInstance(id, props);
    }
    assertNotTerminal() {
        if (TERMINAL.includes(this.props.status))
            throw new domain_error_1.InvariantViolationError(`Step is already ${this.props.status} and cannot change.`);
    }
    assignTo(userId) {
        this.assertNotTerminal();
        this.props.assignedToUserId = userId;
    }
    start() {
        this.assertNotTerminal();
        if (!this.props.assignedToUserId)
            throw new domain_error_1.InvariantViolationError("Cannot start an unassigned step.");
        this.props.status = enums_1.StepInstanceStatus.IN_PROGRESS;
        this.props.startedAt = this.props.startedAt ?? new Date();
    }
    complete() {
        this.assertNotTerminal();
        this.props.status = enums_1.StepInstanceStatus.DONE;
        this.props.completedAt = new Date();
    }
    reject() {
        this.assertNotTerminal();
        this.props.status = enums_1.StepInstanceStatus.REJECTED;
        this.props.completedAt = new Date();
    }
    skip() {
        this.assertNotTerminal();
        this.props.status = enums_1.StepInstanceStatus.SKIPPED;
        this.props.completedAt = new Date();
    }
    scheduleSla(dueAt) {
        this.assertNotTerminal();
        if (this.props.slaDueAt)
            return;
        this.props.slaDueAt = dueAt;
    }
    pauseSla() {
        this.props.slaPaused = true;
        this.props.status = enums_1.StepInstanceStatus.WAITING;
    }
    resumeSla() {
        this.props.slaPaused = false;
        this.props.status = enums_1.StepInstanceStatus.IN_PROGRESS;
    }
    get status() { return this.props.status; }
    get workflowStepId() { return this.props.workflowStepId; }
    get assignedToUserId() { return this.props.assignedToUserId; }
    isTerminal() { return TERMINAL.includes(this.props.status); }
    isDone() { return this.props.status === enums_1.StepInstanceStatus.DONE; }
    snapshot() {
        return {
            id: this.id.toString(),
            requestId: this.props.requestId.toString(),
            workflowStepId: this.props.workflowStepId.toString(),
            assignedToUserId: this.props.assignedToUserId?.toString(),
            status: this.props.status,
            slaDueAt: this.props.slaDueAt,
            slaPaused: this.props.slaPaused,
            startedAt: this.props.startedAt,
            completedAt: this.props.completedAt,
        };
    }
}
exports.RequestStepInstance = RequestStepInstance;
//# sourceMappingURL=request-step-instance.js.map