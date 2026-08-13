"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelegationMapper = void 0;
const delegation_1 = require("../../domain/identity/delegation");
const identifier_1 = require("../../domain/shared/identifier");
exports.DelegationMapper = {
    toDomain(row) {
        return delegation_1.Delegation.rehydrate(identifier_1.Identifier.of(row.id), {
            delegatorId: identifier_1.Identifier.of(row.delegatorId),
            delegateId: identifier_1.Identifier.of(row.delegateId),
            start: row.startDate,
            end: row.endDate,
            isActive: row.isActive,
            reason: row.reason ?? undefined,
        });
    },
    toPersistence(delegation) {
        const s = delegation.snapshot();
        return {
            id: delegation.id.toString(),
            delegatorId: s.delegatorId,
            delegateId: s.delegateId,
            startDate: s.start,
            endDate: s.end,
            isActive: s.isActive,
            reason: s.reason ?? null,
        };
    },
};
//# sourceMappingURL=delegation.mapper.js.map