'use client';
// src/app/dashboard/roles/page.tsx
//
// List of roles. Permission: 'role.manage' -- confirmed from the class-level
// @RequirePermissions('role.manage') on RolesController.

import { useRouter } from 'next/navigation';
import { useRoles } from '@/lib/hooks/use-roles';
import { PermissionGate } from '@/components/permission-gate';
import { DeleteRoleButton } from '@/components/forms/delete-role-button';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

function formatDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function RolesPageContent() {
  const router = useRouter();
  const { data: roles, isLoading, isError } = useRoles();
  const list = roles ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--ics-primary)' }}>
          Roles
        </h1>
        <Button
          onClick={() => router.push('/dashboard/roles/new')}
          className="text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--ics-primary)' }}
        >
          Add Role
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {isError && <p className="text-destructive">Failed to load roles.</p>}
      {!isLoading && !isError && list.length === 0 && (
        <p className="text-muted-foreground">No roles yet.</p>
      )}

      {!isLoading && !isError && list.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Assignments</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  {role.name.ar}
                  {role.name.en && ` (${role.name.en})`}
                </TableCell>
                <TableCell className="max-w-64 truncate">
                  {role.description
                    ? `${role.description.ar}${role.description.en ? ` (${role.description.en})` : ''}`
                    : '—'}
                </TableCell>
                <TableCell>
                  {role.isSystem ? (
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--ics-text) 35%, transparent)' }}
                    >
                      Built-in
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: 'var(--ics-accent)' }}
                    >
                      Custom
                    </span>
                  )}
                </TableCell>
                <TableCell>{role.permissionCount}</TableCell>
                <TableCell>{role.assignmentCount}</TableCell>
                <TableCell>{formatDate(role.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {role.isSystem ? (
                      // Per RoleSummaryView.isSystem's own doc comment: "the
                      // screen should say so rather than offer buttons that
                      // return 400." No Edit/Delete for built-in roles.
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        Built-in — read only
                      </span>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/roles/${role.id}/edit`)}
                        >
                          Edit
                        </Button>
                        <DeleteRoleButton roleId={role.id} />
                      </>
                    )}
                    {/* Manage Permissions is shown for every role -- whether
                        the backend also refuses this for system roles is
                        unconfirmed (only rename/delete are documented as
                        refused). If it turns out to be blocked too, the
                        existing inline error handling on that page will
                        surface it. */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/roles/${role.id}/permissions`)}
                    >
                      Manage Permissions
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default function RolesPage() {
  return (
    <PermissionGate require="role.manage">
      <RolesPageContent />
    </PermissionGate>
  );
}