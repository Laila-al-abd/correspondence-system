'use client';
// src/components/forms/delete-role-button.tsx
//
// Inline delete (retire) button for a role.
// DELETE /roles/:roleId
//
// Notes:
// - Requires 'role.manage' permission.
// - No request body — just the roleId.
// - Refused if anyone is still assigned to the role (backend enforcement).
// - Destructive action → inline two-click confirmation with warning.
// - Uses the standard inline error pattern.

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useRemoveRole } from '@/lib/hooks/use-roles';
import { Button } from '@/components/ui/button';

interface Props {
  /** The role ID to delete. */
  roleId: string;
  /** Optional custom button text. */
  children?: ReactNode;
  /** Optional custom className for styling. */
  className?: string;
  /** Optional callback after successful deletion. */
  onSuccess?: () => void;
}

export function DeleteRoleButton({
  roleId,
  children,
  className,
  onSuccess,
}: Props) {
  const removeRole = useRemoveRole();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setShowConfirm(false);
    setError(null);
    try {
      await removeRole.mutateAsync(roleId);
      onSuccess?.();
    } catch {
      setError('Failed to delete role. It may still have active assignments.');
    }
  }

  function handleClick() {
    if (removeRole.isPending) return;
    setShowConfirm(true);
    setError(null);
  }

  if (showConfirm) {
    return (
      <span className="flex items-center gap-1">
        <Button variant="destructive" size="icon" onClick={handleConfirm} disabled={removeRole.isPending} title="Confirm delete">
          ✓
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowConfirm(false)} disabled={removeRole.isPending} title="Cancel">
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
        disabled={removeRole.isPending}
        className={className}
        title="Delete role"
      >
        {removeRole.isPending ? '⏳' : children ?? '🗑'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );
}