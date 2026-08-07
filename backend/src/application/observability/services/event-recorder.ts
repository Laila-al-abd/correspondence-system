import { Inject, Injectable } from '@nestjs/common'
import { EventLog } from '../../../domain/observability/event-log'
import type { EventLogRepository } from '../../../domain/observability/ports/event-log.repository'
import type { IdGenerator } from '../../../domain/shared/id-generator'
import { Identifier } from '../../../domain/shared/identifier'
import {
  CLIENT_CONTEXT,
  EVENT_LOG_REPOSITORY,
  ID_GENERATOR,
} from '../../tokens'
import type { ClientContextPort } from '../ports/client-context.port'

/**
 * The single place that writes the append-only trail in `event_logs`.
 *
 * The table, its mapper and its repository have existed since the first
 * migration and nothing ever called them, which made the audit trail a promise
 * the schema kept and the code did not: `request_actions` recorded the
 * decisions a person typed a comment on, and everything else -- a
 * classification, a confirmation, a routing, a step opening or closing -- left
 * no trace of who did it or from where.
 *
 * Two deliberate differences from NotificationEmitter, which is best-effort:
 *
 * 1. Failures are not swallowed. A notification that goes missing costs someone
 *    a refresh; an audit row that goes missing means the system asserts a fact
 *    it cannot account for. Callers append inside the transaction that carries
 *    the decision, so either both land or neither does.
 * 2. The actor and the IP are read from the request context rather than passed
 *    in. Most of these commands never carried an actorId -- classification,
 *    routing and workflow start all act on behalf of whoever holds the token --
 *    and this is what attributes the AI service's calls to its own account
 *    without inventing a parameter for it to fill in.
 */
@Injectable()
export class EventRecorder {
  constructor(
    @Inject(EVENT_LOG_REPOSITORY) private readonly events: EventLogRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
    @Inject(CLIENT_CONTEXT) private readonly client: ClientContextPort,
  ) {}

  /**
   * A move from one stage of a request's life to another.
   *
   * Stages rather than the raw `current_status`, because every interesting
   * transition before work begins happens while the status is DRAFT: classified,
   * sent to review, confirmed and disputed would all be logged as DRAFT -> DRAFT
   * and the trail would record that nothing happened five times.
   */
  async statusChanged(p: {
    requestId: string
    from?: string
    to: string
    actorId?: string
  }): Promise<void> {
    await this.events.append(
      EventLog.statusChanged(this.ids.next(), {
        requestId: Identifier.of(p.requestId),
        from: p.from,
        to: p.to,
        actorId: this.actor(p.actorId),
        ipAddress: this.client.ipAddress(),
      }),
    )
  }

  /** A decision filed against a request, mirroring its `request_actions` row. */
  async actionTaken(p: {
    requestId: string
    actorId: string
    actionTypeId: string
    stepInstanceId?: string
  }): Promise<void> {
    await this.events.append(
      EventLog.actionTaken(this.ids.next(), {
        requestId: Identifier.of(p.requestId),
        actorId: Identifier.of(p.actorId),
        actionTypeId: Identifier.of(p.actionTypeId),
        requestStepInstanceId: p.stepInstanceId
          ? Identifier.of(p.stepInstanceId)
          : undefined,
        ipAddress: this.client.ipAddress(),
      }),
    )
  }

  async stepStarted(p: {
    requestId: string
    stepInstanceId: string
    actorId?: string
  }): Promise<void> {
    await this.events.append(
      EventLog.stepStarted(this.ids.next(), {
        requestId: Identifier.of(p.requestId),
        requestStepInstanceId: Identifier.of(p.stepInstanceId),
        actorId: this.actor(p.actorId),
        ipAddress: this.client.ipAddress(),
      }),
    )
  }

  async stepCompleted(p: {
    requestId: string
    stepInstanceId: string
    actorId?: string
  }): Promise<void> {
    await this.events.append(
      EventLog.stepCompleted(this.ids.next(), {
        requestId: Identifier.of(p.requestId),
        requestStepInstanceId: Identifier.of(p.stepInstanceId),
        actorId: this.actor(p.actorId),
        ipAddress: this.client.ipAddress(),
      }),
    )
  }

  /**
   * A step being given an owner.
   *
   * The actor is whoever did the routing -- a person assigning manually, or the
   * holder of the token that started the workflow when the resolver picked the
   * owner. Who it was routed *to* is on the step instance itself, which is the
   * row this event points at.
   */
  async assigned(p: {
    requestId: string
    stepInstanceId: string
    actorId?: string
  }): Promise<void> {
    await this.events.append(
      EventLog.assigned(this.ids.next(), {
        requestId: Identifier.of(p.requestId),
        requestStepInstanceId: Identifier.of(p.stepInstanceId),
        actorId: this.actor(p.actorId),
        ipAddress: this.client.ipAddress(),
      }),
    )
  }

  /**
   * Who did it. An explicit actor wins, because a handler that knows the answer
   * knows it better than the ambient context; otherwise the signed-in caller,
   * which covers the commands that never carried one.
   */
  private actor(explicit?: string): Identifier | undefined {
    const actorId = explicit ?? this.client.userId()
    return actorId ? Identifier.of(actorId) : undefined
  }
}
