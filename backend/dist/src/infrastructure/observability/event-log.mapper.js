"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventLogMapper = void 0;
const event_log_1 = require("../../domain/observability/event-log");
const identifier_1 = require("../../domain/shared/identifier");
exports.EventLogMapper = {
    toDomain(row) {
        return event_log_1.EventLog.rehydrate(identifier_1.Identifier.of(row.id), {
            requestId: row.requestId != null ? identifier_1.Identifier.of(row.requestId) : undefined,
            requestStepInstanceId: row.requestStepInstanceId != null
                ? identifier_1.Identifier.of(row.requestStepInstanceId)
                : undefined,
            actorId: row.actorId != null ? identifier_1.Identifier.of(row.actorId) : undefined,
            actionTypeId: row.actionTypeId != null ? identifier_1.Identifier.of(row.actionTypeId) : undefined,
            eventType: row.eventType,
            fromStatus: row.fromStatus ?? undefined,
            toStatus: row.toStatus ?? undefined,
            ipAddress: row.ipAddress ?? undefined,
            occurredAt: row.occurredAt,
        });
    },
    toPersistence(event) {
        const s = event.snapshot();
        return {
            id: event.id.toString(),
            requestId: s.requestId ? s.requestId : null,
            requestStepInstanceId: s.requestStepInstanceId
                ? s.requestStepInstanceId
                : null,
            actorId: s.actorId ? s.actorId : null,
            actionTypeId: s.actionTypeId ? s.actionTypeId : null,
            eventType: s.eventType,
            fromStatus: s.fromStatus ?? null,
            toStatus: s.toStatus ?? null,
            ipAddress: s.ipAddress ?? null,
            occurredAt: s.occurredAt,
        };
    },
};
//# sourceMappingURL=event-log.mapper.js.map