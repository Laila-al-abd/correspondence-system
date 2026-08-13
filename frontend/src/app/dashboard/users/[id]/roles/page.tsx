'use client';
// src/app/dashboard/users/[id]/roles/page.tsx
//
// GET /users/:userId itself only needs 'user.manage' (class-level), so the
// page loads under that alone. But assign/revoke role are overridden with
// @RequirePermissions('user.manage', 'role.manage') -- both required. Per
// this project's convention, that's an inline hasPermission() check on the
// mutation controls, not a second PermissionGate (which only takes one code).

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUser, useAssignRole, useRevokeRole } from '@/lib/hooks/use-users';
import { useRoles } from '@/lib/hooks/use-roles';
import { useDepartmentTree } from '@/lib/hooks/use-organization';
import { usePermissions } from '@/lib/auth/permissions-provider';
import { PermissionGate } from '@/components/permission-gate';
import { AssignRoleDto } from '@/types/identity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

interface FlatDept {
  id: string;
  name: { ar: string; en?: string };
  parentId: string | null;
  prefix: string;
}
function flattenTree(
  nodes: { id: string; name: { ar: string; en?: string }; parentId: string | null; children: any[] }[],
  parentPath = '',
): FlatDept[] {
  return nodes.flatMap((node) => [
    { id: node.id, name: node.name, parentId: node.parentId, prefix: parentPath },
    ...flattenTree(node.children ?? [], `${parentPath}${node.name.ar} / `),
  ]);
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function ManageRolesContent() {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const { data: user, isLoading, isError } = useUser(userId);
  const { data: allRoles } = useRoles();
  const { data: treeData } = useDepartmentTree(true);
  const { hasPermission } = usePermissions();
  const canManageRoles = hasPermission('role.manage');

  const assignRole = useAssignRole(userId);
  const revokeRole = useRevokeRole(userId);

  const flatDepartments = treeData ? flattenTree(treeData) : [];

  const [roleId, setRoleId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  if (isLoading) return <p className="p-6 text-muted-foreground">Loading…</p>;
  if (isError || !user) return <p className="p-6 text-destructive">User not found.</p>;

  async function handleAssign(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!roleId) {
      setFormError('Role is required.');
      return;
    }
    const request: AssignRoleDto = {
      roleId,
      departmentId: departmentId || undefined,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      reason: reason.trim() || undefined,
    };
    try {
      await assignRole.mutateAsync(request);
      setRoleId('');
      setDepartmentId('');
      setExpiresAt('');
      setReason('');
    } catch {
      setFormError('Failed to assign role. Please try again.');
    }
  }

  async function handleRevoke(assignedRoleId: string, departmentId?: string) {
    setRevokeError(null);
    try {
      await revokeRole.mutateAsync({ roleId: assignedRoleId, departmentId });
    } catch {
      setRevokeError('Failed to revoke role. Please try again.');
    }
  }

  return (
    <div className="p-6 space-y-4">
      <Link href="/dashboard/users" className="text-sm font-medium hover:underline" style={{ color: 'var(--ics-accent)' }}>
        ← Back to users
      </Link>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle style={{ color: 'var(--ics-primary)' }}>
            Roles for {user.fullNameAr}{user.fullNameEn && ` (${user.fullNameEn})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {user.roles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No roles assigned.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Assigned</TableHead>
                  {canManageRoles && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.roles.map((r) => (
                  <TableRow key={`${r.roleId}-${r.departmentId ?? 'global'}`}>
                    <TableCell>{r.roleName.ar}{r.roleName.en && ` (${r.roleName.en})`}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.departmentId ?? 'Global'}</TableCell>
                    <TableCell>{formatDate(r.expiresAt)}</TableCell>
                    <TableCell>{formatDate(r.assignedAt)}</TableCell>
                    {canManageRoles && (
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevoke(r.roleId, r.departmentId ?? undefined)}
                          disabled={revokeRole.isPending}
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {revokeError && <p className="text-sm text-destructive">{revokeError}</p>}

          <Separator />

          {!canManageRoles ? (
            <p className="text-sm text-muted-foreground">
              You need the role.manage permission to change role assignments.
            </p>
          ) : (
            <form onSubmit={handleAssign} className="space-y-3">
              <p className="text-sm font-medium">Assign a role</p>
              <div className="space-y-1">
                <Label htmlFor="roleId">Role <span className="text-destructive">*</span></Label>
                <select id="roleId" className={selectClass} value={roleId} onChange={(e) => setRoleId(e.target.value)} disabled={assignRole.isPending} required>
                  <option value="">— select role —</option>
                  {(allRoles ?? []).map((r) => (
                    <option key={r.id} value={r.id}>{r.name.ar}{r.name.en ? ` (${r.name.en})` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="departmentId">Department scope (optional)</Label>
                <select id="departmentId" className={selectClass} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} disabled={assignRole.isPending}>
                  <option value="">— global —</option>
                  {flatDepartments.map((d) => (
                    <option key={d.id} value={d.id}>{d.prefix}{d.name.ar}{d.name.en ? ` (${d.name.en})` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="expiresAt">Expires (optional)</Label>
                <Input id="expiresAt" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} disabled={assignRole.isPending} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} disabled={assignRole.isPending} maxLength={500} />
              </div>
              {formError && <p className="text-sm text-destructive">{formError}</p>}
              <Button type="submit" disabled={assignRole.isPending}>
                {assignRole.isPending ? 'Assigning…' : 'Assign Role'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ManageUserRolesPage() {
  return (
    <PermissionGate require="user.manage">
      <ManageRolesContent />
    </PermissionGate>
  );
}