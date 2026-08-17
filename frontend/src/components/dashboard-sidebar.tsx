'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, LogOut } from 'lucide-react';
import { useLogout } from '@/lib/hooks/use-auth';
import { usePermissions } from '@/lib/auth/permissions-provider';

// `permission`, when present, hides the entry from anyone who lacks it. Without
// that filter an ordinary employee would see a link that only ever renders
// "You don't have access to this page."
const NAV_ITEMS: {
  href: string;
  label: string;
  icon: typeof Home;
  permission?: string;
}[] = [
  // Two entries on purpose. The sidebar is for the places any signed-in person
  // returns to constantly; every administrative destination lives on the
  // dashboard cards, which are permission-filtered the same way. One list of
  // admin links rather than two means a new screen cannot be added in one place
  // and forgotten in the other.
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/requests', label: 'My Requests', icon: FileText },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const logout = useLogout();
  const { hasPermission } = usePermissions();
  const items = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  return (
    <aside
      className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r"
      style={{
        borderColor: 'color-mix(in srgb, var(--ics-primary) 15%, transparent)',
        backgroundColor: 'var(--ics-background)',
      }}
    >
      <div className="px-4 py-4">
        <span className="text-sm font-semibold" style={{ color: 'var(--ics-primary)' }}>
          ICS
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {items.map((item) => {
          // Prefix match so child routes (…/departments/new) keep the parent
          // entry lit; '/dashboard' is exact or it would match everything.
          const active =
            item.href === '/dashboard'
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
              style={
                active
                  ? { backgroundColor: 'var(--ics-primary)', color: '#fff' }
                  : { color: 'var(--ics-text)', opacity: 0.75 }
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-8">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-6 w-6" />
          Log out
        </button>
      </div>
    </aside>
  );
}