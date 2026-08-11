'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/reports', label: 'Overview' },
  { href: '/dashboard/reports/volume', label: 'Volume' },
  { href: '/dashboard/reports/paths', label: 'Paths' },
  { href: '/dashboard/reports/steps', label: 'Steps' },
  { href: '/dashboard/reports/classification', label: 'Classification' },
];

export function ReportsNav() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1 border-b pb-2">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            style={
              active
                ? { backgroundColor: 'var(--ics-primary)', color: '#fff' }
                : { color: 'var(--ics-text)', opacity: 0.7 }
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}