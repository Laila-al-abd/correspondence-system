// src/app/dashboard/delegations/new/page.tsx
import Link from 'next/link';
import { PermissionGate } from '@/components/permission-gate';
import { DelegationForm } from '@/components/forms/delegation-form';

export default function NewDelegationPage() {
  return (
    <PermissionGate require="user.manage">
      <div className="p-6 space-y-4">
        <Link
          href="/dashboard/delegations"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--ics-accent)' }}
        >
          ← Back to delegations
        </Link>
        <DelegationForm />
      </div>
    </PermissionGate>
  );
}