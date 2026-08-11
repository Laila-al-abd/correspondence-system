'use client';
import { useRouter } from 'next/navigation';
import { useMarkNotificationRead } from '@/lib/hooks/use-notifications';
import { NotificationView } from '@/types/observability';
import { resolveNotificationTarget } from './routing';

/**
 * Shared click behavior for every clickable notification (the list page,
 * and the live toast). Marking-as-read is best-effort -- a failed mark-read
 * must never block navigation, same "notifying never breaks the operation"
 * philosophy as NotificationEmitter itself.
 */
export function useNotificationClick() {
  const router = useRouter();
  const markRead = useMarkNotificationRead();

  return async function open(notification: NotificationView) {
    if (!notification.isRead) {
      try {
        await markRead.mutateAsync(notification.id);
      } catch {
        // Still navigate below even if this failed.
      }
    }
    router.push(resolveNotificationTarget(notification));
  };
}