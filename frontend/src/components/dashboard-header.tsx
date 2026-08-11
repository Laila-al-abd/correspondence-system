'use client';
import Link from 'next/link';
import { NotificationBell } from './notification-bell';

export function DashboardHeader() {
  return (
    <header
      className="sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4"
      style={{ backgroundColor: 'var(--ics-background)', borderColor: 'color-mix(in srgb, var(--ics-primary) 15%, transparent)' }}
    >
      <Link href="/dashboard" className="text-sm font-semibold" style={{ color: 'var(--ics-primary)' }}>
        ICS
      </Link>
      <NotificationBell />
    </header>
  );
}