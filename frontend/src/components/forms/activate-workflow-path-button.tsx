'use client';
// src/components/forms/activate-workflow-path-button.tsx
//
// Inline activate button for a workflow path.
// POST /workflow-paths/:id/activate
//
// Notes:
// - Requires 'workflow.manage' permission.
// - No request body — just the workflow path ID.
// - Activating makes this the default path for its template (deactivates any other active path).
// - Single-field, low-complexity mutation → inline two-click confirmation.

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useActivateWorkflowPath } from '@/lib/hooks/use-workflow';
import { ActivateWorkflowPathResponse } from '@/types/workflow';
import { Button } from '@/components/ui/button';

interface Props {
  /** The workflow path ID to activate. */
  workflowPathId: string;
  /** Optional custom button text. */
  children?: ReactNode;
  /** Optional custom className for styling. */
  className?: string;
  /** Optional callback after successful activation. */
  onSuccess?: (response: ActivateWorkflowPathResponse) => void;
}

export function ActivateWorkflowPathButton({
  workflowPathId,
  children,
  className,
  onSuccess,
}: Props) {
  const activateWorkflowPath = useActivateWorkflowPath();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setShowConfirm(false);
    setError(null);
    try {
      const response = await activateWorkflowPath.mutateAsync(workflowPathId);
      onSuccess?.(response);
    } catch {
      setError('Failed to activate workflow path. Please try again.');
    }
  }

  function handleClick() {
    if (activateWorkflowPath.isPending) return;
    setShowConfirm(true);
    setError(null);
  }

  if (showConfirm) {
    return (
      <span className="flex items-center gap-1">
        <Button variant="default" size="icon" onClick={handleConfirm} disabled={activateWorkflowPath.isPending} title="Confirm activate">
          ✓
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowConfirm(false)} disabled={activateWorkflowPath.isPending} title="Cancel">
          ✕
        </Button>
        {error && <p className="text-sm text-destructive whitespace-nowrap">{error}</p>}
      </span>
    );
  }

  return (
    <>
      <Button
        variant="default"
        onClick={handleClick}
        disabled={activateWorkflowPath.isPending}
        className={className}
        title="Activate workflow path"
      >
        {activateWorkflowPath.isPending ? '⏳' : children ?? '▶ Activate'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );
}