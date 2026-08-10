'use client';
// src/components/forms/revoke-role-permission-button.tsx
//
// Inline revoke permission button for a role.
// DELETE /roles/:roleId/permissions/:code
//
// Notes:
// - Requires 'role.manage' permission.
// - No request body — just the roleId and permission code from URL params.
// - Single-field, low-complexity destructive mutation → inline two-click confirmation.
// - Uses the standard inline error pattern.

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useRevokeRolePermission } from '@/lib/hooks/use-roles';
import { Button } from '@/components/ui/button';

interface Props {
  /** The role ID. */
  roleId: string;
  /** The permission code to revoke. */
  permissionCode: string;
  /** Optional custom button text. */
  children?: ReactNode;
  /** Optional custom className for styling. */
  className?: string;
  /** Optional callback after successful revocation. */
  onSuccess?: () => void;
}

export function RevokeRolePermissionButton({
  roleId,
  permissionCode,
  children,
  className,
  onSuccess,
}: Props) {
  const revokePermission = useRevokeRolePermission(roleId);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setShowConfirm(false);
    setError(null);
    try {
      await revokePermission.mutateAsync(permissionCode);
      onSuccess?.();
    } catch {
      setError('Failed to revoke permission. Please try again.');
    }
  }

  function handleClick() {
    if (revokePermission.isPending) return;
    setShowConfirm(true);
    setError(null);
  }

  if (showConfirm) {
    return (
      <span className="flex items-center gap-1">
        <Button variant="destructive" size="icon" onClick={handleConfirm} disabled={revokePermission.isPending} title="Confirm revoke">
          ✓
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowConfirm(false)} disabled={revokePermission.isPending} title="Cancel">
          ✕
        </Button>
        {error && <p className="text-sm text-destructive whitespace-nowrap">{error}</p>}
      </span>
    );
  }

  return (
    <>
      <Button
        variant="destructive"
        size="icon"
        onClick={handleClick}
        disabled={revokePermission.isPending}
        className={className}
        title="Revoke permission"
      >
        {revokePermission.isPending ? '⏳' : children ?? '✕'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );
}