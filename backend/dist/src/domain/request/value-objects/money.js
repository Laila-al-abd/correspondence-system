"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
const value_object_1 = require("../../shared/value-object");
const domain_error_1 = require("../../shared/domain-error");
class Money extends value_object_1.ValueObject {
    constructor(props) { super(props); }
    static create(amount, currency = "SYP") {
        if (!(amount >= 0))
            throw new domain_error_1.InvariantViolationError("Amount must be non-negative.");
        return new Money({ amount, currency });
    }
    get amount() { return this.props.amount; }
    get currency() { return this.props.currency; }
}
exports.Money = Money;
//# sourceMappingURL=money.js.map