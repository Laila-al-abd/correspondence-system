'use client';
// src/components/forms/assign-step-form.tsx
//
// Form for assigning a workflow step to a user.
// POST /requests/:id/steps/:stepId/assign
//
// Notes:
// - Requires 'request.act' permission.
// - assigneeUserId is a UUID referencing a User entity.
// - The dropdown is driven by GET /requests/:id/steps/:stepId/candidates, NOT
//   by the full user directory. Those are the people the assign command will
//   accept; offering anyone else just produces a 403 after the click.
// - Candidates come in two tiers. "Recommended" is who automatic routing would
//   have picked. The rest hold the step's role in another department, which is
//   allowed on purpose -- department scope guides the router, it is not a
//   permission boundary.
// - Current user ID comes from auth context (the actor assigning).

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAssignStep, useStepCandidates } from '@/lib/hooks/use-requests';
import { useUsers } from '@/lib/hooks/use-users';
import {
  AssignStepDto,
  AssignStepResponse,
  StepCandidateView,
} from '@/types/request';
import { UserSummaryView } from '@/types/identity';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

interface Props {
  /** The request ID. */
  requestId: string;
  /** The step instance ID to assign. */
  stepId: string;
  /** Optional step info for display (e.g., step name). */
  stepName?: string;
  /** Optional existing assignment to edit — not used (assignment is one-shot). */
  existing?: never;
  /** Optional callback after successful assignment. */
  onSuccess?: (response: AssignStepResponse) => void;
}

export function AssignStepForm({ requestId, stepId, stepName, existing, onSuccess }: Props) {
  const router = useRouter();
  const assignStep = useAssignStep();

  // Who the backend will accept for THIS step.
  const { data: candidateList, isLoading: candidatesLoading } =
    useStepCandidates(requestId, stepId);

  // The directory is still fetched, but only to turn ids into names. It is not
  // what decides who is offered.
  const { data: usersPage } = useUsers(1, 200);
  const users = usersPage?.items ?? [];
  const userById = new Map<string, UserSummaryView>(
    users.map((u) => [u.id, u])
  );

  const candidates = candidateList?.candidates ?? [];
  // No eligible pool means the step is unroutable and the command falls back to
  // permitting any active user, so the dropdown does the same rather than
  // showing an empty list on the one screen meant to unstick the request.
  const unrestricted = candidateList?.unrestricted ?? false;

  const [assigneeUserId, setAssigneeUserId] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPending = assignStep.isPending;

  function nameOf(userId: string): string {
    const user = userById.get(userId);
    if (!user) return `User (${userId.slice(0, 8)}…)`;
    const en = user.fullNameEn ?? '';
    return `${user.fullNameAr}${en ? ` (${en})` : ''} — ${user.email}`;
  }

  function candidateLabel(candidate: StepCandidateView): string {
    const load =
      candidate.openStepCount === 1
        ? '1 open step'
        : `${candidate.openStepCount} open steps`;
    return `${nameOf(candidate.userId)} — ${load}`;
  }

  const recommended = candidates.filter((c) => c.recommended);
  const wider = candidates.filter((c) => !c.recommended);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!assigneeUserId) {
      setSubmitError('Assignee is required.');
      return;
    }

    const request: AssignStepDto = {
      assigneeUserId,
    };

    try {
      const response = await assignStep.mutateAsync({ id: requestId, stepId, request });
      // When rendered in a dialog the caller closes it; navigating as well would
      // reload the page the admin is already on.
      if (onSuccess) onSuccess(response);
      else router.push(`/dashboard/requests/${requestId}`);
    } catch {
      setSubmitError('Failed to assign step. Please try again.');
    }
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Assign Step</CardTitle>
        <CardDescription>
          Assign this workflow step to a user. The assignee will see this request in
          their assigned queue and can act on it. {stepName && `Step: ${stepName}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Only people the assign command will accept for this step. */}
          <div className="space-y-1">
            <Label htmlFor="assigneeUserId">Assignee <span className="text-destructive">*</span></Label>
            <select
              id="assigneeUserId"
              className={selectClass}
              value={assigneeUserId}
              onChange={(e) => setAssigneeUserId(e.target.value)}
              disabled={isPending || candidatesLoading}
              required
            >
              <option value="">
                {candidatesLoading ? '— loading eligible users —' : '— select user —'}
              </option>

              {recommended.length > 0 && (
                <optgroup label="Recommended for this step">
                  {recommended.map((c) => (
                    <option key={c.userId} value={c.userId}>
                      {candidateLabel(c)}
                    </option>
                  ))}
                </optgroup>
              )}

              {wider.length > 0 && (
                <optgroup label="Also holds this role (other departments)">
                  {wider.map((c) => (
                    <option key={c.userId} value={c.userId}>
                      {candidateLabel(c)}
                    </option>
                  ))}
                </optgroup>
              )}

              {unrestricted && (
                <optgroup label="No eligible role holder — any active user">
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {nameOf(u.id)}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            {!candidatesLoading && unrestricted && (
              <p className="text-xs text-destructive">
                Nobody holds the role this step requires, so the step could not be
                routed automatically. Anyone active can be assigned as a stopgap,
                but the step definition or the role assignments probably need
                fixing.
              </p>
            )}
            {!candidatesLoading && !unrestricted && (
              <p className="text-xs text-muted-foreground">
                Sorted least-busy first. The person who raised the request is never
                listed.
              </p>
            )}
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? 'Assigning…' : 'Assign Step'}
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