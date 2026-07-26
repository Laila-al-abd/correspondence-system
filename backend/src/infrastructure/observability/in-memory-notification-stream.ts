import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { Observable, Subject, filter, map } from 'rxjs'
import type {
  NotificationStreamEvent,
  NotificationStreamPort,
} from '../../application/observability/ports/notification-stream.port'

/** One published notification, tagged with its intended recipient. */
interface AddressedEvent {
  userId: string
  event: NotificationStreamEvent
}

/**
 * In-process live delivery built on a single RxJS Subject.
 *
 * Every publish goes onto one shared stream and each subscriber filters it down
 * to its own user. This is preferred over keeping a Map of one Subject per
 * connected user because there is no bookkeeping to get wrong: no entry to
 * create on connect, none to delete on disconnect, and therefore no way to leak
 * a Subject for a user who has gone away. RxJS tears the subscription down when
 * the HTTP response closes.
 *
 * Publishing is fire-and-forget by design. Nothing is queued for offline users,
 * because it does not need to be: the notification is already committed to the
 * database, so a user who was disconnected simply sees it in their inbox on the
 * next request. Losing a push loses nothing.
 *
 * Scope: this delivers within one Node process. If the API is ever scaled to
 * several instances behind a load balancer, a user connected to instance A
 * would not receive a push produced on instance B -- their inbox stays correct,
 * only the live update is missed. The fix is to swap this adapter for one backed
 * by Redis pub/sub; because it sits behind NotificationStreamPort, no use case
 * or controller changes.
 */
@Injectable()
export class InMemoryNotificationStream
  implements NotificationStreamPort, OnModuleDestroy
{
  private readonly logger = new Logger(InMemoryNotificationStream.name)
  private readonly events = new Subject<AddressedEvent>()

  publish(userId: string, event: NotificationStreamEvent): void {
    try {
      this.events.next({ userId, event })
    } catch (error) {
      // A misbehaving subscriber must never affect the caller, which is in the
      // middle of a business operation.
      this.logger.warn(
        `Could not push a live notification to user ${userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
  }

  streamFor(userId: string): Observable<NotificationStreamEvent> {
    return this.events.asObservable().pipe(
      filter((message) => message.userId === userId),
      map((message) => message.event),
    )
  }

  /** Closes every open stream cleanly on shutdown. */
  onModuleDestroy(): void {
    this.events.complete()
  }
}
