"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowStep = void 0;
const entity_1 = require("../shared/entity");
const domain_error_1 = require("../shared/domain-error");
const enums_1 = require("./enums");
class WorkflowStep extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        WorkflowStep.assertAssigneeConsistent(p.assigneeType, p.assigneeRoleId, p.assigneeDepartmentId);
        if (p.slaHours !== undefined && p.slaHours <= 0)
            throw new domain_error_1.InvariantViolationError("slaHours must be positive when set.");
        if (p.feeAmount !== undefined && !(p.feeAmount > 0))
            throw new domain_error_1.InvariantViolationError("feeAmount must be positive when set.");
        return new WorkflowStep(id, {
            name: p.name,
            description: p.description,
            assigneeType: p.assigneeType,
            assigneeRoleId: p.assigneeRoleId,
            assigneeDepartmentId: p.assigneeDepartmentId,
            defaultActionTypeId: p.defaultActionTypeId,
            slaHours: p.slaHours,
            pausesSla: p.pausesSla ?? false,
            feeAmount: p.feeAmount,
            feeCurrency: p.feeAmount !== undefined ? (p.feeCurrency ?? "SYP") : undefined,
            allowedActionTypeIds: new Set(),
            dependsOnStepIds: new Set(),
        });
    }
    static rehydrate(id, props) {
        return new WorkflowStep(id, props);
    }
    static assertAssigneeConsistent(type, roleId, departmentId) {
        if (type === enums_1.AssigneeType.SPECIFIC_ROLE && !roleId)
            throw new domain_error_1.InvariantViolationError("A SPECIFIC_ROLE step requires an assignee role.");
        if (type === enums_1.AssigneeType.SPECIFIC_UNIT && !departmentId)
            throw new domain_error_1.InvariantViolationError("A SPECIFIC_UNIT step requires an assignee department.");
        if ((type === enums_1.AssigneeType.REQUESTER_DEPARTMENT_HEAD ||
            type === enums_1.AssigneeType.REQUESTER_FACULTY_DEAN) &&
            !roleId)
            throw new domain_error_1.InvariantViolationError("A requester-department-head or requester-faculty-dean step requires an assignee role: the head of a unit is modelled as the holder of a role scoped to that unit.");
    }
    allowAction(actionTypeId) {
        this.props.allowedActionTypeIds.add(actionTypeId.toString());
    }
    dependOn(stepId) {
        if (stepId.equals(this.id))
            throw new domain_error_1.InvariantViolationError("A step cannot depend on itself.");
        this.props.dependsOnStepIds.add(stepId.toString());
    }
    permits(actionTypeId) {
        return this.props.allowedActionTypeIds.has(actionTypeId.toString());
    }
    get dependencyIds() { return [...this.props.dependsOnStepIds]; }
    get assigneeType() { return this.props.assigneeType; }
    get slaHours() { return this.props.slaHours; }
    get pausesSla() { return this.props.pausesSla; }
    get fee() {
        if (this.props.feeAmount === undefined)
            return undefined;
        return { amount: this.props.feeAmount, currency: this.props.feeCurrency ?? "SYP" };
    }
    chargesFee() { return this.props.feeAmount !== undefined; }
    snapshot() {
        return {
            id: this.id.toString(),
            name: this.props.name.toJSON(),
            description: this.props.description?.toJSON(),
            assigneeType: this.props.assigneeType,
            assigneeRoleId: this.props.assigneeRoleId?.toString(),
            assigneeDepartmentId: this.props.assigneeDepartmentId?.toString(),
            defaultActionTypeId: this.props.defaultActionTypeId?.toString(),
            slaHours: this.props.slaHours,
            pausesSla: this.props.pausesSla,
            feeAmount: this.props.feeAmount,
            feeCurrency: this.props.feeCurrency,
            allowedActionTypeIds: [...this.props.allowedActionTypeIds],
            dependsOnStepIds: [...this.props.dependsOnStepIds],
        };
    }
}
exports.WorkflowStep = WorkflowStep;
//# sourceMappingURL=workflow-step.js.map