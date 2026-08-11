'use client';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUnreadNotificationCount } from '@/lib/hooks/use-notifications';

export function NotificationBell() {
  const router = useRouter();
  const { data } = useUnreadNotificationCount();
  const unread = data?.unread ?? 0;

  return (
    <button
      type="button"
      onClick={() => router.push('/dashboard/notifications')}
      className="relative rounded-full p-2 hover:bg-black/5 transition-colors"
      aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
    >
      <Bell className="h-5 w-5" style={{ color: 'var(--ics-text)' }} />
      {unread > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
          style={{ backgroundColor: '#dc2626' }}
        >
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </button>
  );
}