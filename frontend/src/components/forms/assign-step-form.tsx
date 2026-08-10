'use client';
// src/components/forms/assign-step-form.tsx
//
// Form for assigning a workflow step to a user.
// POST /requests/:id/steps/:stepId/assign
//
// Notes:
// - Requires 'request.act' permission.
// - assigneeUserId is a UUID referencing a User entity.
// - Real listing endpoint exists (GET /users) → dropdown (Case a).
// - No update route exists → create-only (assignment is a one-way action).
// - Current user ID comes from auth context (the actor assigning).

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAssignStep } from '@/lib/hooks/use-requests';
import { useUsers } from '@/lib/hooks/use-users';
import { AssignStepDto, AssignStepResponse } from '@/types/request';
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

  // Fetch all users for dropdown (unfiltered, large page)
  const { data: usersPage } = useUsers(1, 200);
  const users = usersPage?.items ?? [];

  const [assigneeUserId, setAssigneeUserId] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPending = assignStep.isPending;

  function getUserLabel(user: UserSummaryView): string {
    const en = user.fullNameEn ?? '';
    return `${user.fullNameAr}${en ? ` (${en})` : ''} — ${user.email}`;
  }

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
      onSuccess?.(response);
      router.push(`/dashboard/requests/${requestId}`);
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
          {/* Assignee dropdown — Case (a): real listing endpoint exists */}
          <div className="space-y-1">
            <Label htmlFor="assigneeUserId">Assignee <span className="text-destructive">*</span></Label>
            <select
              id="assigneeUserId"
              className={selectClass}
              value={assigneeUserId}
              onChange={(e) => setAssigneeUserId(e.target.value)}
              disabled={isPending}
              required
            >
              <option value="">— select user —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {getUserLabel(u)}
                </option>
              ))}
            </select>
            {users.length === 0 && (
              <p className="text-xs text-muted-foreground">No users available.</p>
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