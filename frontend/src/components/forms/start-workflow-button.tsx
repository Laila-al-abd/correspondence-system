'use client';
// src/components/forms/start-workflow-button.tsx
//
// Inline start workflow button.
// POST /requests/:id/start
//
// Notes:
// - Requires 'request.act' permission (staff only).
// - No request body — just routes the request onto its template's active workflow path.
// - Single-field, low-complexity mutation → small inline control.
// - Uses the standard inline error pattern with two-click confirmation.

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useStartWorkflow } from '@/lib/hooks/use-requests';
import { Button } from '@/components/ui/button';
import { StartWorkflowResponse } from '@/types/request';

interface Props {
  /** The request ID to start. */
  requestId: string;
  /** Optional custom button text. */
  children?: ReactNode;
  /** Optional custom className for styling. */
  className?: string;
  /** Optional callback after successful start (for side effects). */
  onSuccess?: (response: StartWorkflowResponse) => void;
}

export function StartWorkflowButton({
  requestId,
  children,
  className,
  onSuccess,
}: Props) {
  const startWorkflow = useStartWorkflow();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setShowConfirm(false);
    setError(null);
    try {
      const response = await startWorkflow.mutateAsync(requestId);
      onSuccess?.(response);
    } catch {
      setError('Failed to start workflow. Please try again.');
    }
  }

  function handleClick() {
    if (startWorkflow.isPending) return;
    setShowConfirm(true);
    setError(null);
  }

  if (showConfirm) {
    return (
      <span className="flex items-center gap-1">
        <Button variant="default" size="icon" onClick={handleConfirm} disabled={startWorkflow.isPending} title="Confirm start workflow">
          ▶
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowConfirm(false)} disabled={startWorkflow.isPending} title="Cancel">
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
        disabled={startWorkflow.isPending}
        className={className}
        title="Start workflow"
      >
        {startWorkflow.isPending ? '⏳' : children ?? '▶ Start Workflow'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );
}