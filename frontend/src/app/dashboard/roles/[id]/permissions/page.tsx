'use client';
// src/app/dashboard/roles/[id]/permissions/page.tsx
//
// Checkbox grid over every permission, grouped, checked state reflecting
// whether this role currently holds it. Wired directly to
// useGrantRolePermission/useRevokeRolePermission -- the same mutations
// GrantRolePermissionButton/RevokeRolePermissionButton use -- rather than
// nesting those components, since their dropdown/two-click-confirm shape
// doesn't fit a checkbox representing current state.

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useRole,
  usePermissionGroups,
  useGrantRolePermission,
  useRevokeRolePermission,
} from '@/lib/hooks/use-roles';
import { PermissionGate } from '@/components/permission-gate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function PermissionsPageContent() {
  const params = useParams<{ id: string }>();
  const roleId = params.id;

  const { data: role, isLoading: roleLoading, isError: roleError } = useRole(roleId);
  const { data: groupsData, isLoading: groupsLoading } = usePermissionGroups();
  const groups = groupsData ?? [];

  const grantPermission = useGrantRolePermission(roleId);
  const revokePermission = useRevokeRolePermission(roleId);

  // Tracks the one code currently being toggled, so only that row disables
  // rather than the whole page -- both mutation hooks are shared across every
  // checkbox, since calling a hook per-row would violate Rules of Hooks.
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (roleLoading || groupsLoading) return <p className="p-6 text-muted-foreground">Loading…</p>;
  if (roleError || !role) return <p className="p-6 text-destructive">Role not found.</p>;

  const grantedCodes = new Set(role.permissions.map((p) => p.code));

  async function handleToggle(code: string, nextChecked: boolean) {
    setPendingCode(code);
    setError(null);
    try {
      if (nextChecked) {
        await grantPermission.mutateAsync({ code });
      } else {
        await revokePermission.mutateAsync(code);
      }
    } catch {
      setError(
        `Failed to ${nextChecked ? 'grant' : 'revoke'} "${code}". Please try again.`,
      );
    } finally {
      setPendingCode(null);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <Link
        href="/dashboard/roles"
        className="text-sm font-medium hover:underline"
        style={{ color: 'var(--ics-accent)' }}
      >
        ← Back to roles
      </Link>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle style={{ color: 'var(--ics-primary)' }}>
            Permissions for {role.name.ar}
            {role.name.en && ` (${role.name.en})`}
          </CardTitle>
          {role.isSystem && (
            // Informational only -- unconfirmed whether the backend also
            // refuses permission changes on system roles (only rename/delete
            // are documented as refused). If a toggle fails, the error
            // below will say so.
            <p className="text-xs text-muted-foreground">
              This is a built-in role. If a change here fails, the backend may
              not allow editing its permissions either.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {groups.map((group) => (
            <div key={group.id} className="space-y-2">
              <div>
                <p className="text-sm font-medium">
                  {group.name.ar}
                  {group.name.en && ` (${group.name.en})`}
                </p>
                {group.description && (
                  <p className="text-xs text-muted-foreground">
                    {group.description.ar}
                    {group.description.en && ` (${group.description.en})`}
                  </p>
                )}
              </div>
              <div className="space-y-1.5 pl-1">
                {group.permissions.map((perm) => {
                  const checked = grantedCodes.has(perm.code);
                  const isPending = pendingCode === perm.code;
                  return (
                    <label
                      key={perm.code}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={isPending}
                        onChange={(e) => handleToggle(perm.code, e.target.checked)}
                        className="h-4 w-4 rounded border-input"
                        style={{ accentColor: 'var(--ics-primary)' }}
                      />
                      <span className={isPending ? 'opacity-50' : undefined}>
                        {perm.name.ar}
                        {perm.name.en && ` (${perm.name.en})`}{' '}
                        <span className="text-muted-foreground">— {perm.code}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <Separator className="mt-3" />
            </div>
          ))}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RolePermissionsPage() {
  return (
    <PermissionGate require="role.manage">
      <PermissionsPageContent />
    </PermissionGate>
  );
}