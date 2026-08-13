"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlePaymentHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const request_action_1 = require("../../../../domain/request/request-action");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const event_recorder_1 = require("../../../observability/services/event-recorder");
const settle_payment_command_1 = require("./settle-payment.command");
const ACTION_CODE = {
    [settle_payment_command_1.PaymentSettlement.CONFIRM]: 'CONFIRM_PAYMENT',
    [settle_payment_command_1.PaymentSettlement.WAIVE]: 'WAIVE_PAYMENT',
};
let SettlePaymentHandler = class SettlePaymentHandler {
    payments;
    actions;
    actionTypes;
    ids;
    transaction;
    events;
    constructor(payments, actions, actionTypes, ids, transaction, events) {
        this.payments = payments;
        this.actions = actions;
        this.actionTypes = actionTypes;
        this.ids = ids;
        this.transaction = transaction;
        this.events = events;
    }
    async execute({ input, }) {
        const payment = await this.payments.findById(identifier_1.Identifier.of(input.paymentId));
        if (!payment || payment.snapshot().requestId !== input.requestId)
            throw new errors_1.EntityNotFoundError('Payment', input.paymentId);
        const code = ACTION_CODE[input.settlement];
        const actionType = await this.actionTypes.findByCode(code);
        if (!actionType)
            throw new errors_1.EntityNotFoundError('ActionType', code);
        const actor = identifier_1.Identifier.of(input.actorId);
        const before = payment.snapshot();
        await this.transaction.run(async () => {
            if (input.settlement === settle_payment_command_1.PaymentSettlement.CONFIRM) {
                payment.confirm(actor);
            }
            else {
                payment.waive(actor, input.reason ?? '');
            }
            await this.payments.save(payment);
            await this.actions.append(request_action_1.RequestAction.create(this.ids.next(), {
                requestId: identifier_1.Identifier.of(before.requestId),
                actorId: actor,
                actionTypeId: actionType.id,
                requestStepInstanceId: before.requestStepInstanceId
                    ? identifier_1.Identifier.of(before.requestStepInstanceId)
                    : undefined,
                comment: input.settlement === settle_payment_command_1.PaymentSettlement.WAIVE
                    ? `Fee waived (${before.amount} ${before.currency}): ${input.reason}`
                    : `Fee confirmed: ${before.amount} ${before.currency}`,
            }));
            await this.events.actionTaken({
                requestId: before.requestId,
                actorId: input.actorId,
                actionTypeId: actionType.id.toString(),
                stepInstanceId: before.requestStepInstanceId ?? undefined,
            });
        });
        const after = payment.snapshot();
        return {
            id: payment.id.toString(),
            status: after.status,
            settledAt: after.settledAt?.toISOString(),
        };
    }
};
exports.SettlePaymentHandler = SettlePaymentHandler;
exports.SettlePaymentHandler = SettlePaymentHandler = __decorate([
    (0, cqrs_1.CommandHandler)(settle_payment_command_1.SettlePaymentCommand),
    __param(0, (0, common_1.Inject)(tokens_1.PAYMENT_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.REQUEST_ACTION_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.ACTION_TYPE_REPOSITORY)),
    __param(3, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __param(4, (0, common_1.Inject)(tokens_1.TRANSACTION_RUNNER)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, event_recorder_1.EventRecorder])
], SettlePaymentHandler);
//# sourceMappingURL=settle-payment.handler.js.map