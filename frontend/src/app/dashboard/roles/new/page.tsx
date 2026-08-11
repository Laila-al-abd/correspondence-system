// src/app/dashboard/roles/new/page.tsx
import Link from 'next/link';
import { PermissionGate } from '@/components/permission-gate';
import { RoleForm } from '@/components/forms/role-form';

export default function NewRolePage() {
  return (
    <PermissionGate require="role.manage">
      <div className="p-6 space-y-4">
        <Link
          href="/dashboard/roles"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--ics-accent)' }}
        >
          ← Back to roles
        </Link>
        <RoleForm />
      </div>
    </PermissionGate>
  );
}