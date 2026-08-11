'use client';
// No PermissionGate: every NotificationsController route is scoped to
// CurrentUserId with no extra permission required (per that controller's
// own doc comment) -- being authenticated (already enforced by proxy.ts's
// auth_token check) is the only requirement.

import { useState } from 'react';
import { useNotifications, useMarkAllNotificationsRead } from '@/lib/hooks/use-notifications';
import { useNotificationClick } from '@/lib/notifications/use-notification-click';
import { NotificationView } from '@/types/observability';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 20;

function formatTime(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

function NotificationRow({ notification }: { notification: NotificationView }) {
  const open = useNotificationClick();
  // The rule you asked for: unread -> highlighted and clickable. Once read
  // (by clicking, or by "mark all as read", or on any other client), it's
  // permanently gray and inert -- re-viewing this page never re-lights it.
  const clickable = !notification.isRead;

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => open(notification) : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter') open(notification); } : undefined}
      className={`rounded-lg border p-4 transition-colors ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
      style={
        clickable
          ? {
              backgroundColor: 'color-mix(in srgb, var(--ics-secondary) 20%, transparent)',
              borderColor: 'var(--ics-primary)',
            }
          : {
              backgroundColor: 'color-mix(in srgb, var(--ics-text) 5%, transparent)',
              borderColor: 'transparent',
              opacity: 0.65,
            }
      }
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium" style={{ color: clickable ? 'var(--ics-primary)' : 'var(--ics-text)' }}>
          {notification.title}
        </p>
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatTime(notification.createdAt)}
        </span>
      </div>
      {notification.body && (
        <p className="mt-1 text-sm" style={{ color: 'var(--ics-text)', opacity: 0.8 }}>
          {notification.body}
        </p>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading, isError } = useNotifications(undefined, PAGE_SIZE, offset);
  const markAllRead = useMarkAllNotificationsRead();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--ics-primary)' }}>
          Notifications
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending || total === 0}
        >
          {markAllRead.isPending ? 'Marking…' : 'Mark all as read'}
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {isError && <p className="text-destructive">Failed to load notifications.</p>}
      {!isLoading && !isError && items.length === 0 && (
        <p className="text-muted-foreground">No notifications yet.</p>
      )}

      <div className="space-y-2">
        {items.map((n) => (
          <NotificationRow key={n.id} notification={n} />
        ))}
      </div>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))} disabled={offset === 0}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
          </span>
          <Button variant="outline" size="sm" onClick={() => setOffset((o) => o + PAGE_SIZE)} disabled={offset + PAGE_SIZE >= total}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}