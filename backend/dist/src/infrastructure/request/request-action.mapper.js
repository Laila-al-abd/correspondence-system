"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestActionMapper = void 0;
const request_action_1 = require("../../domain/request/request-action");
const identifier_1 = require("../../domain/shared/identifier");
exports.RequestActionMapper = {
    toDomain(row) {
        return request_action_1.RequestAction.rehydrate(identifier_1.Identifier.of(row.id), {
            requestId: identifier_1.Identifier.of(row.requestId),
            requestStepInstanceId: row.requestStepInstanceId != null
                ? identifier_1.Identifier.of(row.requestStepInstanceId)
                : undefined,
            actorId: identifier_1.Identifier.of(row.actorId),
            actionTypeId: identifier_1.Identifier.of(row.actionTypeId),
            comment: row.comment ?? undefined,
            createdAt: row.createdAt,
        });
    },
    toPersistence(action) {
        const s = action.snapshot();
        return {
            id: action.id.toString(),
            requestId: s.requestId,
            requestStepInstanceId: s.requestStepInstanceId
                ? s.requestStepInstanceId
                : null,
            actorId: s.actorId,
            actionTypeId: s.actionTypeId,
            comment: s.comment ?? null,
            createdAt: s.createdAt,
        };
    },
};
//# sourceMappingURL=request-action.mapper.js.map