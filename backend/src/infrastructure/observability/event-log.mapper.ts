import {
  Prisma,
  EventLog as EventLogRow,
} from '../../../generated/prisma/client'
import { EventLog } from '../../domain/observability/event-log'
import { EventType } from '../../domain/observability/enums'
import { Identifier } from '../../domain/shared/identifier'

/** Maps between the EventLog entity and the append-only `event_logs` row. */
export const EventLogMapper = {
  toDomain(row: EventLogRow): EventLog {
    return EventLog.rehydrate(Identifier.of(row.id), {
      requestId:
        row.requestId != null ? Identifier.of(row.requestId) : undefined,
      requestStepInstanceId:
        row.requestStepInstanceId != null
          ? Identifier.of(row.requestStepInstanceId)
          : undefined,
      actorId: row.actorId != null ? Identifier.of(row.actorId) : undefined,
      actionTypeId:
        row.actionTypeId != null ? Identifier.of(row.actionTypeId) : undefined,
      eventType: row.eventType as EventType,
      fromStatus: row.fromStatus ?? undefined,
      toStatus: row.toStatus ?? undefined,
      ipAddress: row.ipAddress ?? undefined,
      occurredAt: row.occurredAt,
    })
  },

  toPersistence(event: EventLog): Prisma.EventLogUncheckedCreateInput {
    const s = event.snapshot()
    return {
      id: BigInt(event.id.toString()),
      requestId: s.requestId ? BigInt(s.requestId) : null,
      requestStepInstanceId: s.requestStepInstanceId
        ? BigInt(s.requestStepInstanceId)
        : null,
      actorId: s.actorId ? BigInt(s.actorId) : null,
      actionTypeId: s.actionTypeId ? BigInt(s.actionTypeId) : null,
      eventType: s.eventType,
      fromStatus: s.fromStatus ?? null,
      toStatus: s.toStatus ?? null,
      ipAddress: s.ipAddress ?? null,
      occurredAt: s.occurredAt,
    }
  },
}
