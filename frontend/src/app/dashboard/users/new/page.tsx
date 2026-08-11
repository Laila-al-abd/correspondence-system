// src/app/dashboard/users/new/page.tsx
import Link from 'next/link';
import { PermissionGate } from '@/components/permission-gate';
import { CreateUserForm } from '@/components/forms/create-user-form';

export default function NewUserPage() {
  return (
    <PermissionGate require="user.manage">
      <div className="p-6 space-y-4">
        <Link href="/dashboard/users" className="text-sm font-medium hover:underline" style={{ color: 'var(--ics-accent)' }}>
          ← Back to users
        </Link>
        <CreateUserForm />
      </div>
    </PermissionGate>
  );
}