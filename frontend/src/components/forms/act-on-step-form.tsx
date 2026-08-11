'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useActOnStep } from '@/lib/hooks/use-requests';
import { useActionTypes } from '@/lib/hooks/use-action-type';
import { ActOnStepDto, ActOnStepResponse, StepActionKind } from '@/types/request';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  /** The request ID. */
  requestId: string;
  /** The step instance ID to act on. */
  stepId: string;
  /** Optional step info for display. */
  stepName?: string;
  /** Current step status (e.g., PENDING, IN_PROGRESS). */
  currentStepStatus?: string;
  /** Allowed action type IDs for this step instance. */
  allowedActionTypeIds?: string[];
  /** Callback after successful action execution. */
  onSuccess?: (response: ActOnStepResponse) => void;
  /** Callback to close the dialog modal. */
  onClose?: () => void;
}

export function ActOnStepForm({
  requestId,
  stepId,
  stepName,
  currentStepStatus = 'PENDING',
  allowedActionTypeIds = [],
  onSuccess,
  onClose,
}: Props) {
  const router = useRouter();
  const actOnStep = useActOnStep();
  const { data: catalogActionTypes, isLoading: isLoadingActionTypes } = useActionTypes();

  const isPendingStep = currentStepStatus === 'PENDING';

  const [selectedActionTypeId, setSelectedActionTypeId] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPending = actOnStep.isPending;

  // Filter catalog action types to only those allowed on this step
  const availableActionTypes = (catalogActionTypes || []).filter(
    (at) => allowedActionTypeIds.length === 0 || allowedActionTypeIds.includes(at.id)
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    let derivedAction: StepActionKind;
    let finalActionTypeId: string | undefined = undefined;

    // 1. If step is PENDING -> Execute START
    if (isPendingStep) {
      derivedAction = StepActionKind.START;
    } else {
      // 2. If step is IN_PROGRESS -> Require an action selection
      if (!selectedActionTypeId) {
        setSubmitError('Please select an action type to execute.');
        return;
      }

      const selectedType = catalogActionTypes?.find((at) => at.id === selectedActionTypeId);
      const code = (selectedType?.code || '').toUpperCase();
      finalActionTypeId = selectedType?.id;

      // Map catalog code to backend StepActionKind enum
      if (code.includes('REJECT') || code.includes('DENY')) {
        derivedAction = StepActionKind.REJECT;
      } else if (code.includes('SKIP') || code.includes('BYPASS')) {
        derivedAction = StepActionKind.SKIP;
      } else {
        derivedAction = StepActionKind.COMPLETE;
      }

      if (
        (derivedAction === StepActionKind.REJECT || derivedAction === StepActionKind.SKIP) &&
        !finalActionTypeId
      ) {
        setSubmitError('Action type code is required for REJECT or SKIP actions.');
        return;
      }
    }

    if (comment.length > 1000) {
      setSubmitError('Comment must be 1000 characters or fewer.');
      return;
    }

    const payload: ActOnStepDto = {
      action: derivedAction,
      actionTypeId: finalActionTypeId,
      comment: comment.trim() || undefined,
    };

    try {
      const response = await actOnStep.mutateAsync({ id: requestId, stepId, request: payload });
      onSuccess?.(response);
      onClose ? onClose() : router.push(`/dashboard/requests/${requestId}`);
    } catch (err: any) {
      // Extract exact error message from NestJS response
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to execute step action. Please try again.';
      setSubmitError(Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage);
    }
  }

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle>{isPendingStep ? 'Start Working on Step' : 'Execute Step Action'}</CardTitle>
        <CardDescription>
          {stepName ? `Step: ${stepName}` : 'Manage workflow step execution.'}
          {` (Current Status: ${currentStepStatus})`}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SCENARIO A: Step is PENDING -> Show Start Notice */}
          {isPendingStep ? (
            <div className="p-4 bg-muted/60 border rounded-md space-y-1">
              <p className="text-sm font-medium text-(--ics-text)">
                This step is currently <strong>PENDING</strong>.
              </p>
              <p className="text-xs text-muted-foreground">
                You must start working on this step before you can perform completion actions like Approve, Sign, or Reject.
              </p>
            </div>
          ) : (
            /* SCENARIO B: Step is IN_PROGRESS -> Show Allowed Action Types */
            <div className="space-y-2">
              <Label>
                Select Action <span className="text-destructive">*</span>
              </Label>
              {isLoadingActionTypes ? (
                <p className="text-xs text-muted-foreground animate-pulse">Loading available actions…</p>
              ) : availableActionTypes.length === 0 ? (
                <p className="text-xs text-muted-foreground">No specific action types defined for this step.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                  {availableActionTypes.map((at) => (
                    <label
                      key={at.id}
                      className={`flex items-center justify-between p-2.5 border rounded-md cursor-pointer hover:bg-accent transition-colors ${
                        selectedActionTypeId === at.id ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="actionType"
                          value={at.id}
                          checked={selectedActionTypeId === at.id}
                          onChange={() => setSelectedActionTypeId(at.id)}
                          className="h-4 w-4 border-input text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium">
                          {at.name?.ar || at.name?.en || at.code}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{at.code}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Comment Field (Optional) */}
          <div className="space-y-1">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Add optional notes or justification..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isPending}
              maxLength={1000}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">{comment.length}/1000</p>
          </div>

          {submitError && <p className="text-sm text-destructive font-medium">{submitError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => (onClose ? onClose() : router.push(`/dashboard/requests/${requestId}`))}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Processing…' : isPendingStep ? 'Start Step' : 'Execute Action'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}