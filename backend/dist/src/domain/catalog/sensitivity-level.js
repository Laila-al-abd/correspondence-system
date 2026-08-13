"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensitivityLevel = void 0;
const entity_1 = require("../shared/entity");
const domain_error_1 = require("../shared/domain-error");
class SensitivityLevel extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        if (!Number.isInteger(p.rank) || p.rank < 0)
            throw new domain_error_1.InvariantViolationError("Sensitivity rank must be a non-negative integer.");
        return new SensitivityLevel(id, p);
    }
    static rehydrate(id, props) {
        return new SensitivityLevel(id, props);
    }
    get rank() { return this.props.rank; }
    get name() { return this.props.name; }
    isAtLeast(other) { return this.props.rank >= other.props.rank; }
}
exports.SensitivityLevel = SensitivityLevel;
//# sourceMappingURL=sensitivity-level.js.map