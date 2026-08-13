"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlePaymentCommand = exports.PaymentSettlement = void 0;
var PaymentSettlement;
(function (PaymentSettlement) {
    PaymentSettlement["CONFIRM"] = "CONFIRM";
    PaymentSettlement["WAIVE"] = "WAIVE";
})(PaymentSettlement || (exports.PaymentSettlement = PaymentSettlement = {}));
class SettlePaymentCommand {
    input;
    constructor(input) {
        this.input = input;
    }
}
exports.SettlePaymentCommand = SettlePaymentCommand;
//# sourceMappingURL=settle-payment.command.js.map