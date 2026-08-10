'use client';
// src/components/forms/grant-role-permission-button.tsx
//
// Inline grant permission button for a role.
// POST /roles/:roleId/permissions
//
// Notes:
// - Requires 'role.manage' permission.
// - code is required (permission code from GET /roles/permissions).
// - Single-field, low-complexity mutation → inline control with dropdown.
// - Uses the standard inline error pattern.
// - Case (a): real listing endpoint exists (GET /roles/permissions returns PermissionGroupView[]).

import type { ReactNode } from 'react';
import { useState, FormEvent } from 'react';
import { useGrantRolePermission, usePermissionGroups } from '@/lib/hooks/use-roles';
import { GrantPermissionDto, PermissionGroupView } from '@/types/identity';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-xs';

interface Props {
  /** The role ID to grant permission to. */
  roleId: string;
  /** Optional custom button text. */
  children?: ReactNode;
  /** Optional custom className for styling. */
  className?: string;
  /** Optional callback after successful grant. */
  onSuccess?: () => void;
}

export function GrantRolePermissionButton({
  roleId,
  children,
  className,
  onSuccess,
}: Props) {
  const grantPermission = useGrantRolePermission(roleId);
  const { data: permissionGroupsData } = usePermissionGroups();
  const permissionGroups = permissionGroupsData ?? [];

  const [code, setCode] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!code) {
      setError('Permission code is required.');
      return;
    }

    const request: GrantPermissionDto = { code };

    try {
      await grantPermission.mutateAsync(request);
      setShowForm(false);
      setCode('');
      onSuccess?.();
    } catch {
      setError('Failed to grant permission. Please try again.');
    }
  }

  // If showing form, render inline dropdown + submit
  if (showForm) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Label htmlFor={`grant-perm-${roleId}`} className="text-xs text-muted-foreground whitespace-nowrap">
          Permission:
        </Label>
        <select
          id={`grant-perm-${roleId}`}
          className={selectClass}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={grantPermission.isPending}
          style={{ minWidth: '280px' }}
        >
          <option value="">— select permission —</option>
          {permissionGroups.map((group) => (
            <optgroup key={group.id} label={`${group.name.ar}${group.name.en ? ` (${group.name.en})` : ''}`}>
              {group.permissions.map((perm) => (
                <option key={perm.code} value={perm.code}>
                  {perm.name.ar}{perm.name.en ? ` (${perm.name.en})` : ''} — {perm.code}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <Button
          type="submit"
          size="sm"
          disabled={grantPermission.isPending || !code}
        >
          {grantPermission.isPending ? '⏳' : 'Grant'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => { setShowForm(false); setCode(''); setError(null); }}
          disabled={grantPermission.isPending}
        >
          Cancel
        </Button>
        {error && <p className="text-sm text-destructive whitespace-nowrap">{error}</p>}
      </form>
    );
  }

  // Default: just a trigger button
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowForm(true)}
        disabled={grantPermission.isPending}
        className={className}
      >
        {grantPermission.isPending ? '⏳' : children ?? '+ Grant Permission'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );
}