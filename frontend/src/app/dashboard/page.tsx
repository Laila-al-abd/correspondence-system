'use client';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/auth/permissions-provider';
import {
  FileText,
  ClipboardList,
  ListChecks,
  Inbox,
  Layers,
  ShieldCheck,
  Shield,
  Users,
  Repeat,
  BarChart3,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface DashboardCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Omit for a card every authenticated user sees, regardless of role. */
  requiredPermission?: string;
}

// Every requiredPermission here matches an actual @RequirePermissions
// decorator seen on the corresponding controller during this project --
// none of these codes are guessed.
const CARDS: DashboardCard[] = [
  {
    title: 'My Requests',
    description: 'View and manage the requests you have submitted.',
    href: '/dashboard/requests',
    icon: FileText,
  },
  {
    title: 'Assigned to Me',
    description: 'Workflow steps currently routed to you.',
    href: '/dashboard/requests/assigned',
    icon: ClipboardList,
  },
  {
    title: 'HITL Review Queue',
    description: 'Requests the classifier could not confidently route.',
    href: '/dashboard/requests/queue/hitl',
    icon: ListChecks,
    requiredPermission: 'request.classify',
  },
  {
    title: 'Request Queue',
    description: 'All in-flight requests across the institute.',
    href: '/dashboard/requests/queue',
    icon: Inbox,
    requiredPermission: 'request.act',
  },
  {
    title: 'Templates',
    description: 'Manage request templates, fields, and workflows.',
    href: '/dashboard/templates',
    icon: Layers,
    requiredPermission: 'template.manage',
  },
  {
    title: 'Eligibility Check',
    description: 'Check whether a user is eligible for a template.',
    href: '/dashboard/access/eligibility-check',
    icon: ShieldCheck,
    requiredPermission: 'template.manage',
  },
  {
    title: 'Roles',
    description: 'Define roles and the permissions they grant.',
    href: '/dashboard/roles',
    icon: Shield,
    requiredPermission: 'role.manage',
  },
  {
    title: 'Users',
    description: 'Provision accounts and manage roles and attributes.',
    href: '/dashboard/users',
    icon: Users,
    requiredPermission: 'user.manage',
  },
  {
    title: 'Delegations',
    description: 'See who has delegated authority to whom.',
    href: '/dashboard/delegations',
    icon: Repeat,
    requiredPermission: 'user.manage',
  },
  {
    title: 'Reports',
    description: 'Monitoring dashboards for volume, SLAs, and bottlenecks.',
    href: '/dashboard/reports',
    icon: BarChart3,
    requiredPermission: 'reports.view',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading…</div>;
  }

  const visibleCards = CARDS.filter(
    (card) => !card.requiredPermission || hasPermission(card.requiredPermission),
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--ics-primary)' }}>
        Dashboard
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.href}
              role="button"
              tabIndex={0}
              onClick={() => router.push(card.href)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') router.push(card.href);
              }}
              className="cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardHeader>
                <Icon className="mb-1 h-6 w-6 text-(--ics-primary)" />
                <CardTitle className="text-base">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}