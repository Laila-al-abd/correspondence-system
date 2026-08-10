'use client';
// src/components/forms/deactivate-workflow-path-button.tsx
//
// Inline deactivate button for a workflow path.
// POST /workflow-paths/:id/deactivate
//
// Notes:
// - Requires 'workflow.manage' permission.
// - No request body — just the workflow path ID.
// - Deactivating removes it as the default path (template will have no active path).
// - Single-field, low-complexity mutation → inline two-click confirmation.

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useDeactivateWorkflowPath } from '@/lib/hooks/use-workflow';
import { DeactivateWorkflowPathResponse } from '@/types/workflow';
import { Button } from '@/components/ui/button';

interface Props {
  /** The workflow path ID to deactivate. */
  workflowPathId: string;
  /** Optional custom button text. */
  children?: ReactNode;
  /** Optional custom className for styling. */
  className?: string;
  /** Optional callback after successful deactivation. */
  onSuccess?: (response: DeactivateWorkflowPathResponse) => void;
}

export function DeactivateWorkflowPathButton({
  workflowPathId,
  children,
  className,
  onSuccess,
}: Props) {
  const deactivateWorkflowPath = useDeactivateWorkflowPath();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setShowConfirm(false);
    setError(null);
    try {
      const response = await deactivateWorkflowPath.mutateAsync(workflowPathId);
      onSuccess?.(response);
    } catch {
      setError('Failed to deactivate workflow path. Please try again.');
    }
  }

  function handleClick() {
    if (deactivateWorkflowPath.isPending) return;
    setShowConfirm(true);
    setError(null);
  }

  if (showConfirm) {
    return (
      <span className="flex items-center gap-1">
        <Button variant="destructive" size="icon" onClick={handleConfirm} disabled={deactivateWorkflowPath.isPending} title="Confirm deactivate">
          ✓
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowConfirm(false)} disabled={deactivateWorkflowPath.isPending} title="Cancel">
          ✕
        </Button>
        {error && <p className="text-sm text-destructive whitespace-nowrap">{error}</p>}
      </span>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={handleClick}
        disabled={deactivateWorkflowPath.isPending}
        className={className}
        title="Deactivate workflow path"
      >
        {deactivateWorkflowPath.isPending ? '⏳' : children ?? '⏸ Deactivate'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );
}