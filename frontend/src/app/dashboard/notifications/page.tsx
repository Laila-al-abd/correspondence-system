// 'use client';
// // No PermissionGate: every NotificationsController route is scoped to
// // CurrentUserId with no extra permission required (per that controller's
// // own doc comment) -- being authenticated (already enforced by proxy.ts's
// // auth_token check) is the only requirement.

// import { useState } from 'react';
// import { useNotifications, useMarkAllNotificationsRead } from '@/lib/hooks/use-notifications';
// import { useNotificationClick } from '@/lib/notifications/use-notification-click';
// import { NotificationView } from '@/types/observability';
// import { Button } from '@/components/ui/button';

// const PAGE_SIZE = 20;

// function formatTime(value: string): string {
//   const d = new Date(value);
//   return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
// }

// function NotificationRow({ notification }: { notification: NotificationView }) {
//   const open = useNotificationClick();
//   // The rule you asked for: unread -> highlighted and clickable. Once read
//   // (by clicking, or by "mark all as read", or on any other client), it's
//   // permanently gray and inert -- re-viewing this page never re-lights it.
//   const clickable = !notification.isRead;

//   return (
//     <div
//       role={clickable ? 'button' : undefined}
//       tabIndex={clickable ? 0 : undefined}
//       onClick={clickable ? () => open(notification) : undefined}
//       onKeyDown={clickable ? (e) => { if (e.key === 'Enter') open(notification); } : undefined}
//       className={`rounded-lg border p-4 transition-colors ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
//       style={
//         clickable
//           ? {
//               backgroundColor: 'color-mix(in srgb, var(--ics-secondary) 20%, transparent)',
//               borderColor: 'var(--ics-primary)',
//             }
//           : {
//               backgroundColor: 'color-mix(in srgb, var(--ics-text) 5%, transparent)',
//               borderColor: 'transparent',
//               opacity: 0.65,
//             }
//       }
//     >
//       <div className="flex items-start justify-between gap-3">
//         <p className="text-sm font-medium" style={{ color: clickable ? 'var(--ics-primary)' : 'var(--ics-text)' }}>
//           {notification.title}
//         </p>
//         <span className="whitespace-nowrap text-xs text-muted-foreground">
//           {formatTime(notification.createdAt)}
//         </span>
//       </div>
//       {notification.body && (
//         <p className="mt-1 text-sm" style={{ color: 'var(--ics-text)', opacity: 0.8 }}>
//           {notification.body}
//         </p>
//       )}
//     </div>
//   );
// }

// export default function NotificationsPage() {
//   const [offset, setOffset] = useState(0);
//   const { data, isLoading, isError } = useNotifications(undefined, PAGE_SIZE, offset);
//   const markAllRead = useMarkAllNotificationsRead();

//   const items = data?.items ?? [];
//   const total = data?.total ?? 0;

//   return (
//     <div className="p-6 space-y-4 max-w-2xl">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-semibold" style={{ color: 'var(--ics-primary)' }}>
//           Notifications
//         </h1>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => markAllRead.mutate()}
//           disabled={markAllRead.isPending || total === 0}
//         >
//           {markAllRead.isPending ? 'Marking…' : 'Mark all as read'}
//         </Button>
//       </div>

//       {isLoading && <p className="text-muted-foreground">Loading…</p>}
//       {isError && <p className="text-destructive">Failed to load notifications.</p>}
//       {!isLoading && !isError && items.length === 0 && (
//         <p className="text-muted-foreground">No notifications yet.</p>
//       )}

//       <div className="space-y-2">
//         {items.map((n) => (
//           <NotificationRow key={n.id} notification={n} />
//         ))}
//       </div>

//       {total > PAGE_SIZE && (
//         <div className="flex items-center justify-between pt-2">
//           <Button variant="outline" size="sm" onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))} disabled={offset === 0}>
//             Previous
//           </Button>
//           <span className="text-xs text-muted-foreground">
//             {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
//           </span>
//           <Button variant="outline" size="sm" onClick={() => setOffset((o) => o + PAGE_SIZE)} disabled={offset + PAGE_SIZE >= total}>
//             Next
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }


'use client';
// src/app/dashboard/notifications/page.tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, BellRing, Check, Inbox } from 'lucide-react';
import { useNotifications, useMarkAllNotificationsRead } from '@/lib/hooks/use-notifications';
import { useNotificationClick } from '@/lib/notifications/use-notification-click';
import { NotificationView } from '@/types/observability';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 20;

function formatTime(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

function NotificationRow({ notification, index }: { notification: NotificationView; index: number }) {
  const open = useNotificationClick();
  const clickable = !notification.isRead;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => open(notification) : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter') open(notification); } : undefined}
      className={`group flex items-start gap-4 rounded-2xl border-2 p-5 transition-all ${
        clickable
          ? 'cursor-pointer border-(--ics-primary)/20 bg-white/70 shadow-sm hover:border-(--ics-primary) hover:bg-white hover:shadow-md'
          : 'cursor-default border-transparent bg-(--ics-text)/5 opacity-70 hover:opacity-100'
      }`}
    >
      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
        clickable ? 'bg-(--ics-primary)/10 text-(--ics-primary)' : 'bg-gray-200/50 text-gray-500'
      }`}>
        {clickable ? <BellRing className="h-5 w-5" /> : <Check className="h-5 w-5" />}
      </div>
      
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <p className={`text-base font-semibold ${clickable ? 'text-(--ics-primary)' : 'text-(--ics-text)'}`}>
            {notification.title}
          </p>
          <span className="whitespace-nowrap text-xs font-medium text-(--ics-text)/50">
            {formatTime(notification.createdAt)}
          </span>
        </div>
        {notification.body && (
          <p className="text-sm leading-relaxed text-(--ics-text)/70">
            {notification.body}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function NotificationsPage() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading, isError } = useNotifications(undefined, PAGE_SIZE, offset);
  const markAllRead = useMarkAllNotificationsRead();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="relative min-h-screen bg-(--ics-background) overflow-hidden">
      {/* Ambient Background matching the theme */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-(--ics-secondary) opacity-[0.1] blur-[100px]" />
        <div className="absolute top-[40%] -right-[15%] h-[60%] w-[50%] rounded-full bg-(--ics-primary) opacity-[0.08] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl space-y-8 p-6 sm:p-10">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-(--ics-primary)">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--ics-primary)/10">
                <Bell className="h-6 w-6" strokeWidth={2.5} />
              </div>
              Notifications
            </h1>
            <p className="mt-2 text-base text-(--ics-text)/70 max-w-2xl">
              Stay updated on your requests and delegation assignments.
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending || total === 0}
            className="h-11 rounded-full border-2 border-(--ics-accent)/20 bg-white/50 px-6 font-semibold text-(--ics-primary) backdrop-blur-sm transition-all hover:border-(--ics-accent) hover:bg-(--ics-accent)/5"
          >
            {markAllRead.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-(--ics-primary) border-t-transparent" />
                Marking...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Mark all as read
              </div>
            )}
          </Button>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {isLoading && (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-(--ics-accent)/10 bg-white/70 p-10 text-(--ics-primary) backdrop-blur-md">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <p className="font-medium">Loading notifications...</p>
            </div>
          )}
          
          {isError && (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-red-200 bg-red-50 p-10 text-red-600">
              <p className="font-medium">Failed to load notifications. Please try again later.</p>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-(--ics-accent)/20 bg-white/40 p-12 text-center backdrop-blur-sm">
              <div className="mb-4 rounded-full bg-(--ics-primary)/10 p-4">
                <Inbox className="h-8 w-8 text-(--ics-primary)" />
              </div>
              <h3 className="text-lg font-semibold text-(--ics-text)">You're all caught up!</h3>
              <p className="mt-2 text-sm text-(--ics-text)/60 max-w-sm">
                You have no notifications at the moment.
              </p>
            </div>
          )}

          {!isLoading && !isError && items.length > 0 && (
            <div className="space-y-4">
              {items.map((n, idx) => (
                <NotificationRow key={n.id} notification={n} index={idx} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {total > PAGE_SIZE && (
            <div className="mt-8 flex items-center justify-between rounded-xl border border-(--ics-accent)/10 bg-white/50 p-4 backdrop-blur-sm">
              <Button
                variant="outline"
                className="rounded-full border-(--ics-accent)/20 text-(--ics-text)"
                onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                disabled={offset === 0}
              >
                Previous
              </Button>
              <span className="text-sm font-medium text-(--ics-text)/60">
                {offset + 1} – {Math.min(offset + PAGE_SIZE, total)} of {total}
              </span>
              <Button
                variant="outline"
                className="rounded-full border-(--ics-accent)/20 text-(--ics-text)"
                onClick={() => setOffset((o) => o + PAGE_SIZE)}
                disabled={offset + PAGE_SIZE >= total}
              >
                Next
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
