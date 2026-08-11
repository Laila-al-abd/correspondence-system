'use client';
// src/app/dashboard/roles/[id]/edit/page.tsx
//
// Uses useParams() per this project's convention, not a params prop.

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRole } from '@/lib/hooks/use-roles';
import { PermissionGate } from '@/components/permission-gate';
import { RoleForm } from '@/components/forms/role-form';

function EditRoleContent() {
  const params = useParams<{ id: string }>();
  const { data: role, isLoading, isError } = useRole(params.id);

  if (isLoading) return <p className="p-6 text-muted-foreground">Loading…</p>;
  if (isError || !role) return <p className="p-6 text-destructive">Role not found.</p>;

  return (
    <div className="p-6 space-y-4">
      <Link
        href="/dashboard/roles"
        className="text-sm font-medium hover:underline"
        style={{ color: 'var(--ics-accent)' }}
      >
        ← Back to roles
      </Link>

      {role.isSystem ? (
        // Backend refuses this outright (see UpdateRoleHandler's docstring
        // and Role.assertMutable) -- shown instead of a form that would
        // just 400 on submit, per RoleSummaryView.isSystem's own comment.
        <p className="text-muted-foreground">
          &quot;{role.name.ar}&quot; is a built-in role and cannot be edited.
        </p>
      ) : (
        <RoleForm existing={role} />
      )}
    </div>
  );
}

export default function EditRolePage() {
  return (
    <PermissionGate require="role.manage">
      <EditRoleContent />
    </PermissionGate>
  );
}