'use client';
// Mounted ONCE (in dashboard/layout.tsx). useNotificationStream mints a
// fresh single-use ticket per connect -- mounting this in more than one
// place would open redundant SSE connections. The bell's unread count and
// the notifications list both already refresh on every event, because
// useNotificationStream invalidates all `notifications` queries internally;
// this component's only job is the transient pop-up itself.

import { useCallback, useState } from 'react';
import { useNotificationStream } from '@/lib/hooks/use-notifications';
import { NotificationView } from '@/types/observability';
import { useNotificationClick } from '@/lib/notifications/use-notification-click';

interface ToastItem {
  key: string;
  notification: NotificationView;
}

const AUTO_DISMISS_MS = 7000;

export function NotificationToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const openNotification = useNotificationClick();

  const handleNewNotification = useCallback((notification: NotificationView) => {
    const key = `${notification.id}-${Date.now()}`;
    setToasts((prev) => [...prev, { key, notification }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.key !== key));
    }, AUTO_DISMISS_MS);
  }, []);

  useNotificationStream(handleNewNotification);

  function dismiss(key: string) {
    setToasts((prev) => prev.filter((t) => t.key !== key));
  }

  async function handleClick(item: ToastItem) {
    dismiss(item.key);
    await openNotification(item.notification);
  }

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((item) => (
        <div
          key={item.key}
          role="button"
          tabIndex={0}
          onClick={() => handleClick(item)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleClick(item); }}
          className="cursor-pointer rounded-lg border-2 bg-white p-3 shadow-lg transition-transform hover:-translate-y-0.5"
          style={{ borderColor: 'var(--ics-primary)' }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold" style={{ color: 'var(--ics-primary)' }}>
              {item.notification.title}
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); dismiss(item.key); }}
              className="text-xs opacity-50 hover:opacity-100"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
          {item.notification.body && (
            <p className="mt-1 text-xs" style={{ color: 'var(--ics-text)', opacity: 0.75 }}>
              {item.notification.body}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}