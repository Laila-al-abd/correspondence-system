/**
 * Presentation-ready shapes for the notifications API. Dates are ISO strings
 * and ids are strings, so BigInt keys never leak into JSON.
 */
export interface NotificationView {
  id: string
  type: string
  title: string
  body: string | null
  requestId: string | null
  isRead: boolean
  createdAt: string
}

/** Payload for the unread badge. */
export interface UnreadCountView {
  unread: number
}

/** Result of marking notifications as read. */
export interface MarkReadResult {
  marked: number
}

/** Result of one retention pass. */
export interface PurgeResult {
  deleted: number
  retentionDays: number
  cutoff: string
}
