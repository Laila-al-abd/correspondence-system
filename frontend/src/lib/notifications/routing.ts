// src/lib/notifications/routing.ts
//
// Maps a notification to where clicking it should navigate. This is
// deliberately the ONLY place this mapping lives -- the bell, the toast, and
// the notifications list all resolve through this one function, so fixing a
// wrong destination later is a one-line change here, not a hunt through
// three components.
import { NotificationType, NotificationView } from '@/types/observability';

export function resolveNotificationTarget(notification: NotificationView): string {
  const id = notification.requestId;
  switch (notification.type) {
    case NotificationType.STEP_ASSIGNED:
      // Real page: dashboard/requests/assigned/page.tsx
      return '/dashboard/requests/assigned';

    case NotificationType.PAYMENT_REQUESTED:
    case NotificationType.REQUEST_STATE_CHANGED:
    case NotificationType.ACTION_TAKEN:
      // Real page: dashboard/requests/page.tsx -- assumed to be the
      // requester's own submissions list (mirrors ListMyRequestsQuery),
      // inferred from its position alongside /assigned and /queue in your
      // file split. Worth a quick confirm on your end that this page is
      // in fact "my requests" and not something else.
      return '/dashboard/requests';

    case NotificationType.CLASSIFICATION_NEEDS_REVIEW:
      // Real pages: dashboard/requests/queue/hitl/page.tsx (list) and
      // .../hitl/[id]/page.tsx -- the latter is the actual classify-by-human
      // action page for one specific request, so it's used directly when a
      // requestId is present rather than dropping the reviewer on the list.
      return id ? `/dashboard/requests/queue/hitl/${id}` : '/dashboard/requests/queue/hitl';

    case NotificationType.STEP_ASSIGNMENT_REQUIRED:
      // The generic queue was a dead end: it lists requests but offers no way
      // to assign anything, so the admin was told a step needs an owner and
      // then shown a screen that cannot give it one. The request detail page
      // is where the per-step Assign control lives.
      return id ? `/dashboard/requests/${id}` : '/dashboard/requests/queue';

    case NotificationType.CONFIRMATION_REQUIRED:
      // Real page: dashboard/requests/[id]/edit/page.tsx -- this IS the
      // confirmation form (ConfirmRequestForm), gated on
      // stage === 'AWAITING_CONFIRMATION'. Falls back to the requests list
      // if requestId is somehow missing, per "if not possible takes the
      // user to the requests page."
      return id ? `/dashboard/requests/${id}/edit` : '/dashboard/requests';

    case NotificationType.DELEGATION_GRANTED:
    case NotificationType.DELEGATION_REVOKED:
      return '/dashboard/requests/assigned';

    default:
      return '/dashboard/notifications';
  }
}