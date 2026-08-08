// src/lib/hooks/use-notifications.ts
import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/notifications';
import { NotificationView, ListNotificationsDto } from '@/types/observability';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params?: ListNotificationsDto) =>
    ['notifications', 'list', params?.unreadOnly ?? null, params?.limit ?? null, params?.offset ?? null] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

/** Offset-paginated inbox. Pass a friendly (boolean, number, number) triple; converted to the string-based DTO the backend expects. */
export function useNotifications(unreadOnly?: boolean, limit?: number, offset?: number) {
  const params: ListNotificationsDto = {
    unreadOnly: unreadOnly === undefined ? undefined : String(unreadOnly),
    limit: limit === undefined ? undefined : String(limit),
    offset: offset === undefined ? undefined : String(offset),
  };
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.getAll(params),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: () => notificationsApi.getUnreadCount(),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

/** Admin-only — requires user.manage. */
export function usePurgeNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (retentionDays?: number) => notificationsApi.purge(retentionDays),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

/**
 * Live notification stream over SSE. Not a useQuery — this is a push
 * connection, not a fetch. Mints a fresh single-use ticket on every
 * (re)connect: native EventSource auto-reconnect would reuse the same
 * already-consumed ticket and fail, so reconnection is handled manually.
 */
export function useNotificationStream(onNotification?: (n: NotificationView) => void) {
  const queryClient = useQueryClient();
  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;

  useEffect(() => {
    let source: EventSource | null = null;
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout>;

    async function connect() {
      const { ticket } = await notificationsApi.getStreamTicket();
      if (cancelled) return;

      const base = process.env.NEXT_PUBLIC_API_BASE_URL;
      source = new EventSource(`${base}/notifications/stream?ticket=${encodeURIComponent(ticket)}`);

      source.addEventListener('notification', (event) => {
        const notification = JSON.parse((event as MessageEvent).data) as NotificationView;
        queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        callbackRef.current?.(notification);
      });

      source.onerror = () => {
        source?.close();
        if (!cancelled) retryTimer = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      source?.close();
    };
  }, [queryClient]);
}