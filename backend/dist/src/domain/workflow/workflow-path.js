"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowPath = void 0;
const entity_1 = require("../shared/entity");
const domain_error_1 = require("../shared/domain-error");
class WorkflowPath extends entity_1.AggregateRoot {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        return new WorkflowPath(id, { ...p, isActive: true, steps: [] });
    }
    static rehydrate(id, props) {
        return new WorkflowPath(id, props);
    }
    addStep(step) { this.props.steps.push(step); }
    activate() {
        this.assertValidGraph();
        this.props.isActive = true;
    }
    deactivate() { this.props.isActive = false; }
    get steps() { return this.props.steps; }
    get isActive() { return this.props.isActive; }
    get templateId() { return this.props.templateId; }
    entrySteps() {
        return this.props.steps.filter((s) => s.dependencyIds.length === 0);
    }
    assertValidGraph() {
        if (this.props.steps.length === 0)
            throw new domain_error_1.InvariantViolationError("A workflow path must have at least one step.");
        const ids = new Set(this.props.steps.map((s) => s.id.toString()));
        for (const step of this.props.steps)
            for (const dep of step.dependencyIds)
                if (!ids.has(dep))
                    throw new domain_error_1.InvariantViolationError(`Step depends on unknown step "${dep}".`);
        const indegree = new Map();
        const dependents = new Map();
        for (const s of this.props.steps)
            indegree.set(s.id.toString(), 0);
        for (const s of this.props.steps) {
            const self = s.id.toString();
            for (const dep of s.dependencyIds) {
                indegree.set(self, (indegree.get(self) ?? 0) + 1);
                dependents.set(dep, [...(dependents.get(dep) ?? []), self]);
            }
        }
        const queue = [...indegree.entries()].filter(([, d]) => d === 0).map(([id]) => id);
        let visited = 0;
        while (queue.length > 0) {
            const current = queue.shift();
            visited++;
            for (const next of dependents.get(current) ?? []) {
                indegree.set(next, (indegree.get(next) ?? 0) - 1);
                if (indegree.get(next) === 0)
                    queue.push(next);
            }
        }
        if (visited !== this.props.steps.length)
            throw new domain_error_1.InvariantViolationError("Workflow path contains a dependency cycle.");
        if (this.entrySteps().length === 0)
            throw new domain_error_1.InvariantViolationError("Workflow path has no entry step.");
    }
    dependencyMap() {
        return new Map(this.props.steps.map((s) => [s.id.toString(), s.dependencyIds]));
    }
    snapshot() {
        return {
            templateId: this.props.templateId.toString(),
            name: this.props.name.toJSON(),
            description: this.props.description?.toJSON(),
            isActive: this.props.isActive,
            steps: this.props.steps.map((s) => s.snapshot()),
        };
    }
}
exports.WorkflowPath = WorkflowPath;
//# sourceMappingURL=workflow-path.js.map