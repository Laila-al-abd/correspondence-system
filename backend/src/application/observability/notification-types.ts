/**
 * The events the system notifies people about. Kept as one closed list so the
 * emitter, the API, and the frontend all agree on the vocabulary stored in
 * `notifications.type`.
 */
export const NotificationType = {
  /** A workflow step was routed to you and is waiting for your action. */
  STEP_ASSIGNED: 'STEP_ASSIGNED',
  /** A request you own moved to a new status (started, completed, rejected...). */
  REQUEST_STATE_CHANGED: 'REQUEST_STATE_CHANGED',
  /** Somebody approved, rejected, skipped, or started a step on your request. */
  ACTION_TAKEN: 'ACTION_TAKEN',
  /** The classifier was not confident enough, so a human must decide. */
  CLASSIFICATION_NEEDS_REVIEW: 'CLASSIFICATION_NEEDS_REVIEW',
  /** Delegated authority was granted to you (or by you). */
  DELEGATION_GRANTED: 'DELEGATION_GRANTED',
  /** Delegated authority was withdrawn. */
  DELEGATION_REVOKED: 'DELEGATION_REVOKED',
} as const

export type NotificationTypeCode =
  (typeof NotificationType)[keyof typeof NotificationType]
