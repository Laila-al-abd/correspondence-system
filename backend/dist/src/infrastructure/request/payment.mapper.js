"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMapper = void 0;
const payment_1 = require("../../domain/request/payment");
const money_1 = require("../../domain/request/value-objects/money");
const identifier_1 = require("../../domain/shared/identifier");
exports.PaymentMapper = {
    toDomain(row) {
        return payment_1.Payment.rehydrate(identifier_1.Identifier.of(row.id), {
            requestId: identifier_1.Identifier.of(row.requestId),
            requestStepInstanceId: row.requestStepInstanceId != null
                ? identifier_1.Identifier.of(row.requestStepInstanceId)
                : undefined,
            money: money_1.Money.create(row.amount.toNumber(), row.currency),
            status: row.status,
            requestedBy: row.requestedBy != null ? identifier_1.Identifier.of(row.requestedBy) : undefined,
            settledBy: row.settledBy != null ? identifier_1.Identifier.of(row.settledBy) : undefined,
            requestedAt: row.requestedAt ?? undefined,
            settledAt: row.settledAt ?? undefined,
            waiverReason: row.waiverReason ?? undefined,
        });
    },
    toPersistence(payment) {
        const s = payment.snapshot();
        return {
            id: payment.id.toString(),
            requestId: s.requestId,
            requestStepInstanceId: s.requestStepInstanceId
                ? s.requestStepInstanceId
                : null,
            amount: s.amount,
            currency: s.currency,
            status: s.status,
            requestedBy: s.requestedBy ? s.requestedBy : null,
            settledBy: s.settledBy ? s.settledBy : null,
            requestedAt: s.requestedAt ?? null,
            settledAt: s.settledAt ?? null,
            waiverReason: s.waiverReason ?? null,
        };
    },
};
//# sourceMappingURL=payment.mapper.js.map