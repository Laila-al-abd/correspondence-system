import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { EventType } from "./enums"

interface EventLogProps {
  requestId?: Identifier
  requestStepInstanceId?: Identifier
  actorId?: Identifier
  actionTypeId?: Identifier
  eventType: EventType
  fromStatus?: string
  toStatus?: string
  ipAddress?: string
  occurredAt: Date
}

/**
 * An immutable audit entry. Built through intention-revealing factories so a
 * caller can't assemble a nonsensical event, and never mutated after creation.
 */
export class EventLog extends Entity {
  private constructor(id: Identifier, private props: EventLogProps) {
    super(id)
  }

  static rehydrate(id: Identifier, props: EventLogProps): EventLog {
    return new EventLog(id, props)
  }

  static statusChanged(
    id: Identifier,
    p: { requestId: Identifier; from: string; to: string; actorId?: Identifier; ipAddress?: string },
  ): EventLog {
    return new EventLog(id, {
      requestId: p.requestId,
      eventType: EventType.STATUS_CHANGE,
      fromStatus: p.from,
      toStatus: p.to,
      actorId: p.actorId,
      ipAddress: p.ipAddress,
      occurredAt: new Date(),
    })
  }

  static actionTaken(
    id: Identifier,
    p: {
      requestId: Identifier
      actorId: Identifier
      actionTypeId: Identifier
      requestStepInstanceId?: Identifier
      ipAddress?: string
    },
  ): EventLog {
    return new EventLog(id, {
      requestId: p.requestId,
      requestStepInstanceId: p.requestStepInstanceId,
      actorId: p.actorId,
      actionTypeId: p.actionTypeId,
      eventType: EventType.ACTION_TAKEN,
      ipAddress: p.ipAddress,
      occurredAt: new Date(),
    })
  }

  static stepStarted(
    id: Identifier,
    p: { requestId: Identifier; requestStepInstanceId: Identifier; actorId?: Identifier },
  ): EventLog {
    return new EventLog(id, {
      requestId: p.requestId,
      requestStepInstanceId: p.requestStepInstanceId,
      actorId: p.actorId,
      eventType: EventType.STEP_STARTED,
      occurredAt: new Date(),
    })
  }

  static stepCompleted(
    id: Identifier,
    p: { requestId: Identifier; requestStepInstanceId: Identifier; actorId?: Identifier },
  ): EventLog {
    return new EventLog(id, {
      requestId: p.requestId,
      requestStepInstanceId: p.requestStepInstanceId,
      actorId: p.actorId,
      eventType: EventType.STEP_COMPLETED,
      occurredAt: new Date(),
    })
  }

  static assigned(
    id: Identifier,
    p: { requestId: Identifier; requestStepInstanceId: Identifier; actorId?: Identifier },
  ): EventLog {
    return new EventLog(id, {
      requestId: p.requestId,
      requestStepInstanceId: p.requestStepInstanceId,
      actorId: p.actorId,
      eventType: EventType.ASSIGNED,
      occurredAt: new Date(),
    })
  }

  get eventType(): EventType { return this.props.eventType }
  get requestId(): Identifier | undefined { return this.props.requestId }
}
