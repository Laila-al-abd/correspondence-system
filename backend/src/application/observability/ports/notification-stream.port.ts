import type { Observable } from 'rxjs'
import type { NotificationView } from '../queries/views/notification.view'

/**
 * What a subscriber receives. Deliberately the same shape the REST inbox
 * returns, so the frontend has one notification type: an item that arrives over
 * the live stream can be pushed straight onto the list fetched from
 * `GET /notifications` with no translation.
 */
export type NotificationStreamEvent = NotificationView

/**
 * Live delivery of notifications, as seen by the application layer.
 *
 * This is the "push" half of notifying, and it is intentionally separate from
 * NotificationRepository (the "store" half). Storing is the source of truth and
 * must succeed; pushing is a best-effort optimisation that only reaches users
 * who happen to be connected right now. Keeping them behind different ports
 * means the transport can change -- in-memory today, Redis or a message broker
 * once the API runs on more than one instance -- without touching a single use
 * case.
 */
export interface NotificationStreamPort {
  /** Delivers an event to that user's open connections, if any. Never throws. */
  publish(userId: string, event: NotificationStreamEvent): void

  /** The stream of events for one user. Completing is up to the subscriber. */
  streamFor(userId: string): Observable<NotificationStreamEvent>
}
