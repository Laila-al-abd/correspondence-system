/**
 * Frontend TypeScript types for the Observability module.
 * Synchronized with backend DTOs, command interfaces, and query views.
 * Generated from:
 * - backend/src/interface/observability/dto/*.dto.ts
 * - backend/src/application/observability/commands/**.command.ts
 * - backend/src/application/observability/queries/views/*.view.ts
 * - backend/src/application/observability/notification-types.ts
 * - backend/src/application/observability/ports/*.port.ts
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Notification types - the events the system notifies people about.
 * Source: backend/src/application/observability/notification-types.ts
 */
export enum NotificationType {
  /** A workflow step was routed to you and is waiting for your action. */
  STEP_ASSIGNED = 'STEP_ASSIGNED',
  /** A request you own moved to a new status (started, completed, rejected...). */
  REQUEST_STATE_CHANGED = 'REQUEST_STATE_CHANGED',
  /** Somebody approved, rejected, skipped, or started a step on your request. */
  ACTION_TAKEN = 'ACTION_TAKEN',
  /** The classifier was not confident enough, so a human must decide. */
  CLASSIFICATION_NEEDS_REVIEW = 'CLASSIFICATION_NEEDS_REVIEW',
  /** Delegated authority was granted to you (or by you). */
  DELEGATION_GRANTED = 'DELEGATION_GRANTED',
  /** Delegated authority was withdrawn. */
  DELEGATION_REVOKED = 'DELEGATION_REVOKED',
  /** Auto-routing could not find an owner for one or more steps. */
  STEP_ASSIGNMENT_REQUIRED = 'STEP_ASSIGNMENT_REQUIRED',
  /** The models are done with a request and its requester must confirm it. */
  CONFIRMATION_REQUIRED = 'CONFIRMATION_REQUIRED',
}

// ============================================================================
// DTO Types (matching backend DTOs)
// ============================================================================

/**
 * Query parameters for listing notifications.
 * GET /notifications
 * Matches: backend/src/interface/observability/dto/list-notifications.dto.ts
 */
export interface ListNotificationsDto {
  /** Filter to unread only ('true' | 'false') */
  unreadOnly?: string;

  /** Page size (1..200, default 50) */
  limit?: string;

  /** Zero-based offset */
  offset?: string;
}

// ============================================================================
// Query View Types (matching backend query views)
// ============================================================================

/**
 * Presentation-ready notification view for API responses.
 * Source: backend/src/application/observability/queries/views/notification.view.ts (NotificationView)
 */
export interface NotificationView {
  /** Unique identifier */
  id: string;

  /** Notification type code */
  type: NotificationType;

  /** Notification title */
  title: string;

  /** Notification body (nullable) */
  body: string | null;

  /** Related request ID (nullable) */
  requestId: string | null;

  /** Whether the notification has been read */
  isRead: boolean;

  /** Creation timestamp (ISO string) */
  createdAt: string;
}

/**
 * Unread count view for badge display.
 * Source: backend/src/application/observability/queries/views/notification.view.ts (UnreadCountView)
 */
export interface UnreadCountView {
  /** Number of unread notifications */
  unread: number;
}

/**
 * Result of marking notifications as read.
 * Source: backend/src/application/observability/queries/views/notification.view.ts (MarkReadResult)
 */
export interface MarkReadResult {
  /** Number of notifications marked as read */
  marked: number;
}

/**
 * Result of retention purge operation.
 * Source: backend/src/application/observability/queries/views/notification.view.ts (PurgeResult)
 */
export interface PurgeResult {
  /** Number of notifications deleted */
  deleted: number;

  /** Retention days used */
  retentionDays: number;

  /** Cutoff date (ISO string) */
  cutoff: string;
}
/**
 * Stream ticket response from POST /notifications/stream-ticket
 */
export interface StreamTicketResponse {
  ticket: string;
  expiresInSeconds: number;
}