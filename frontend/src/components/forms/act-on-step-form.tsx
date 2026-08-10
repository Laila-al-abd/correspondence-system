'use client';
// src/components/forms/act-on-step-form.tsx
//
// Form for acting on a workflow step (start, complete, reject, skip).
// POST /requests/:id/steps/:stepId/actions
//
// Notes:
// - Requires 'request.act' permission.
// - action is required enum: START, COMPLETE, REJECT, SKIP.
// - actionTypeId is required when action is REJECT or SKIP (reason for rejection/skip).
//   This is a code from the action type catalog, not a user ID.
// - comment is optional free text.
// - No update route → this records the action and advances the workflow.

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useActOnStep } from '@/lib/hooks/use-requests';
import { ActOnStepDto, ActOnStepResponse, StepActionKind } from '@/types/request';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

const textareaClass =
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

interface Props {
  /** The request ID. */
  requestId: string;
  /** The step instance ID to act on. */
  stepId: string;
  /** Optional step info for display. */
  stepName?: string;
  /** Current step status (for context). */
  currentStepStatus?: string;
  /** Optional existing action to edit — not used (action is one-shot). */
  existing?: never;
  /** Optional callback after successful action. */
  onSuccess?: (response: ActOnStepResponse) => void;
}

const ACTION_LABELS: Record<StepActionKind, string> = {
  [StepActionKind.START]: 'Start — Begin working on this step',
  [StepActionKind.COMPLETE]: 'Complete — Mark step as finished',
  [StepActionKind.REJECT]: 'Reject — Send back with reason',
  [StepActionKind.SKIP]: 'Skip — Bypass this step with reason',
};

const REQUIRES_ACTION_TYPE: StepActionKind[] = [StepActionKind.REJECT, StepActionKind.SKIP];

export function ActOnStepForm({
  requestId,
  stepId,
  stepName,
  currentStepStatus,
  existing,
  onSuccess,
}: Props) {
  const router = useRouter();
  const actOnStep = useActOnStep();

  const [action, setAction] = useState<StepActionKind | ''>('');
  const [actionTypeId, setActionTypeId] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPending = actOnStep.isPending;
  const requiresActionType = action && REQUIRES_ACTION_TYPE.includes(action);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!action) {
      setSubmitError('Action is required.');
      return;
    }
    if (requiresActionType && !actionTypeId.trim()) {
      setSubmitError('Action type (reason code) is required for Reject and Skip actions.');
      return;
    }
    if (actionTypeId.length > 100) {
      setSubmitError('Action type ID must be 100 characters or fewer.');
      return;
    }
    if (comment.length > 1000) {
      setSubmitError('Comment must be 1000 characters or fewer.');
      return;
    }

    const request: ActOnStepDto = {
      action,
      actionTypeId: requiresActionType ? actionTypeId.trim() : undefined,
      comment: comment.trim() || undefined,
    };

    try {
      const response = await actOnStep.mutateAsync({ id: requestId, stepId, request });
      onSuccess?.(response);
      router.push(`/dashboard/requests/${requestId}`);
    } catch {
      setSubmitError('Failed to act on step. Please try again.');
    }
  }

  const statusLabel = currentStepStatus ? ` (current: ${currentStepStatus})` : '';

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Act on Step</CardTitle>
        <CardDescription>
          Choose an action for this workflow step{statusLabel}.
          {stepName && <span> Step: {stepName}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Action selector */}
          <div className="space-y-1">
            <Label>Action <span className="text-destructive">*</span></Label>
            <div className="space-y-2">
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <label
                  key={value}
                  className="flex items-center gap-3 cursor-pointer p-3 border rounded-md hover:bg-accent transition-colors"
                >
                  <input
                    type="radio"
                    name="action"
                    value={value}
                    checked={action === value}
                    onChange={() => setAction(value as StepActionKind)}
                    disabled={isPending}
                    className="h-4 w-4 border-input text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action type ID (conditional) */}
          {requiresActionType && (
            <div className="space-y-1">
              <Label htmlFor="actionTypeId">
                Action type / Reason code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="actionTypeId"
                type="text"
                value={actionTypeId}
                onChange={(e) => setActionTypeId(e.target.value)}
                disabled={isPending}
                placeholder="e.g., INSUFFICIENT_DOCS, OUT_OF_SCOPE, DUPLICATE"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Required for Reject/Skip. Select a code from the action type catalog.
              </p>
            </div>
          )}

          {/* Comment (optional) */}
          <div className="space-y-1">
            <Label htmlFor="comment">Comment (optional)</Label>
            <textarea
              id="comment"
              className={textareaClass}
              placeholder="Additional context for this action..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isPending}
              maxLength={1000}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/1000 characters
            </p>
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? 'Processing…' : `Execute ${action || 'Action'}`}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/requests/${requestId}`)} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}