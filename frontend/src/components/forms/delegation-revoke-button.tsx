'use client';
// src/components/forms/delegation-revoke-button.tsx
//
// Inline revoke button for a delegation.
// POST /delegations/:id/revoke
//
// Single-field, low-complexity mutation → small inline control (not a full Card form).
// Follows the pattern: Button + useRevokeDelegation mutation,
// confirms via lightweight two-click toggle state (consistent with inline error pattern).

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useRevokeDelegation } from '@/lib/hooks/use-delegations';
import { Button } from '@/components/ui/button';

interface Props {
  /** The delegation ID to revoke. */
  delegationId: string;
  /** Optional custom button text. */
  children?: ReactNode;
  /** Optional custom className for styling. */
  className?: string;
  /** Optional callback after successful revocation (for side effects). */
  onSuccess?: () => void;
}

export function DelegationRevokeButton({
  delegationId,
  children,
  className,
  onSuccess,
}: Props) {
  const revokeDelegation = useRevokeDelegation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setShowConfirm(false);
    setError(null);
    try {
      await revokeDelegation.mutateAsync(delegationId);
      onSuccess?.();
    } catch {
      setError('Failed to revoke delegation. Please try again.');
    }
  }

  function handleClick() {
    if (revokeDelegation.isPending) return;
    setShowConfirm(true);
    setError(null);
  }

  if (showConfirm) {
    return (
      <span className="flex items-center gap-1">
        <Button variant="destructive" size="icon" onClick={handleConfirm} disabled={revokeDelegation.isPending} title="Confirm revoke">
          ✓
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowConfirm(false)} disabled={revokeDelegation.isPending} title="Cancel">
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
        disabled={revokeDelegation.isPending}
        className={className}
        title="Revoke delegation"
      >
        {revokeDelegation.isPending ? '⏳' : children ?? '↩'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );
}