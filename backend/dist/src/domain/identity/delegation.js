"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delegation = void 0;
const entity_1 = require("../shared/entity");
const domain_error_1 = require("../shared/domain-error");
class Delegation extends entity_1.AggregateRoot {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        if (p.delegatorId.equals(p.delegateId))
            throw new domain_error_1.InvariantViolationError("Cannot delegate to yourself.");
        if (p.end < p.start)
            throw new domain_error_1.InvariantViolationError("Delegation end date is before its start date.");
        return new Delegation(id, { ...p, isActive: true });
    }
    static rehydrate(id, props) {
        return new Delegation(id, props);
    }
    isEffectiveOn(day) {
        return this.props.isActive && day >= this.props.start && day <= this.props.end;
    }
    revoke() { this.props.isActive = false; }
    get delegateId() { return this.props.delegateId; }
    snapshot() {
        return {
            delegatorId: this.props.delegatorId.toString(),
            delegateId: this.props.delegateId.toString(),
            start: this.props.start,
            end: this.props.end,
            isActive: this.props.isActive,
            reason: this.props.reason,
        };
    }
}
exports.Delegation = Delegation;
//# sourceMappingURL=delegation.js.map