"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const entity_1 = require("../shared/entity");
const guard_1 = require("../shared/guard");
const domain_error_1 = require("../shared/domain-error");
const enums_1 = require("./enums");
class Payment extends entity_1.AggregateRoot {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static request(id, p) {
        return new Payment(id, {
            requestId: p.requestId,
            requestStepInstanceId: p.requestStepInstanceId,
            money: p.money,
            status: enums_1.PaymentStatus.REQUIRED,
            requestedBy: p.requestedBy,
            requestedAt: new Date(),
        });
    }
    static rehydrate(id, props) {
        return new Payment(id, props);
    }
    assertPending() {
        if (this.props.status !== enums_1.PaymentStatus.REQUIRED)
            throw new domain_error_1.InvariantViolationError(`Payment is already ${this.props.status}.`);
    }
    confirm(by) {
        this.assertPending();
        this.props.status = enums_1.PaymentStatus.CONFIRMED;
        this.props.settledBy = by;
        this.props.settledAt = new Date();
    }
    waive(by, reason) {
        this.assertPending();
        this.props.status = enums_1.PaymentStatus.WAIVED;
        this.props.settledBy = by;
        this.props.settledAt = new Date();
        this.props.waiverReason = guard_1.Guard.againstEmpty(reason, "waiverReason");
    }
    get status() { return this.props.status; }
    get money() { return this.props.money; }
    get waiverReason() { return this.props.waiverReason; }
    isSettled() { return this.props.status !== enums_1.PaymentStatus.REQUIRED; }
    snapshot() {
        return {
            requestId: this.props.requestId.toString(),
            requestStepInstanceId: this.props.requestStepInstanceId?.toString(),
            amount: this.props.money.amount,
            currency: this.props.money.currency,
            status: this.props.status,
            requestedBy: this.props.requestedBy?.toString(),
            settledBy: this.props.settledBy?.toString(),
            requestedAt: this.props.requestedAt,
            settledAt: this.props.settledAt,
            waiverReason: this.props.waiverReason,
        };
    }
}
exports.Payment = Payment;
//# sourceMappingURL=payment.js.map