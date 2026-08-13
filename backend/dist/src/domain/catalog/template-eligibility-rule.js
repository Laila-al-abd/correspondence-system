"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateEligibilityRule = void 0;
const entity_1 = require("../shared/entity");
const enums_1 = require("./enums");
class TemplateEligibilityRule extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        return new TemplateEligibilityRule(id, p);
    }
    static rehydrate(id, props) {
        return new TemplateEligibilityRule(id, props);
    }
    get attributeId() { return this.props.attributeId; }
    isSatisfiedBy(actual) {
        const expected = this.props.value;
        switch (this.props.operator) {
            case enums_1.RuleOperator.EQ: return actual === expected;
            case enums_1.RuleOperator.NEQ: return actual !== expected;
            case enums_1.RuleOperator.IN: return Array.isArray(expected) && expected.includes(actual);
            case enums_1.RuleOperator.GTE: return Number(actual) >= Number(expected);
            case enums_1.RuleOperator.LTE: return Number(actual) <= Number(expected);
            default: return false;
        }
    }
    snapshot() {
        return {
            id: this.id.toString(),
            attributeId: this.props.attributeId.toString(),
            operator: this.props.operator,
            value: this.props.value,
        };
    }
}
exports.TemplateEligibilityRule = TemplateEligibilityRule;
//# sourceMappingURL=template-eligibility-rule.js.map