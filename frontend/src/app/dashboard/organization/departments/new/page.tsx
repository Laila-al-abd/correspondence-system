// src/app/dashboard/organization/departments/new/page.tsx
//
// DepartmentForm already existed and already redirected here on success and on
// cancel; only the route was missing. Permission mirrors the list page.

import Link from 'next/link';
import { PermissionGate } from '@/components/permission-gate';
import { DepartmentForm } from '@/components/forms/department-form';

export default function NewDepartmentPage() {
  return (
    <PermissionGate require="user.manage">
      <div className="p-6 space-y-4">
        <Link
          href="/dashboard/organization/departments"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--ics-accent)' }}
        >
          ← Back to departments
        </Link>
        <DepartmentForm />
      </div>
    </PermissionGate>
  );
}
