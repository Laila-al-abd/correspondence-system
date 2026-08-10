'use client';
// src/components/forms/change-priority-form.tsx
//
// Form for changing a request's priority.
// PATCH /requests/:id/priority
//
// Notes:
// - Requires 'request.act' permission (staff only).
// - Priority is an enum: LOW, NORMAL, HIGH, URGENT.
// - Reason is required, 10-500 characters (auditable justification).
// - Current user ID (actorId) comes from auth context.
// - No update route exists for the request itself — this only changes priority.

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useChangePriority } from '@/lib/hooks/use-requests';
import { ChangePriorityDto, Priority } from '@/types/request';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

const textareaClass =
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

interface Props {
  /** The request ID whose priority is being changed. */
  requestId: string;
  /** Current priority (for display/pre-selection). */
  currentPriority: Priority;
  /** Optional existing change to edit — not used (no update route). */
  existing?: never;
}

const PRIORITY_LABELS: Record<Priority, { ar: string; en: string; color: string }> = {
  [Priority.LOW]: { ar: 'منخفض', en: 'Low', color: 'bg-gray-500' },
  [Priority.NORMAL]: { ar: 'عادي', en: 'Normal', color: 'bg-blue-500' },
  [Priority.HIGH]: { ar: 'عالي', en: 'High', color: 'bg-orange-500' },
  [Priority.URGENT]: { ar: 'عاجل', en: 'Urgent', color: 'bg-red-500' },
};

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: Priority.LOW, label: 'LOW (منخفض)' },
  { value: Priority.NORMAL, label: 'NORMAL (عادي)' },
  { value: Priority.HIGH, label: 'HIGH (عالي)' },
  { value: Priority.URGENT, label: 'URGENT (عاجل)' },
];

export function ChangePriorityForm({ requestId, currentPriority, existing }: Props) {
  const router = useRouter();
  const changePriority = useChangePriority();

  const [priority, setPriority] = useState<Priority>(currentPriority);
  const [reason, setReason] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPending = changePriority.isPending;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!priority) {
      setSubmitError('Priority is required.');
      return;
    }
    if (!reason.trim()) {
      setSubmitError('Reason is required (minimum 10 characters).');
      return;
    }
    if (reason.trim().length < 10) {
      setSubmitError('Reason must be at least 10 characters.');
      return;
    }
    if (reason.length > 500) {
      setSubmitError('Reason must be 500 characters or fewer.');
      return;
    }

    const request: ChangePriorityDto = {
      priority,
      reason: reason.trim(),
    };

    try {
      await changePriority.mutateAsync({ id: requestId, request });
      router.push(`/dashboard/requests/${requestId}`);
    } catch {
      setSubmitError('Failed to change priority. Please try again.');
    }
  }

  const currentLabel = PRIORITY_LABELS[currentPriority];
  const selectedLabel = PRIORITY_LABELS[priority];

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Change Request Priority</CardTitle>
        <CardDescription>
          Re-prioritise this request. The reason is recorded as a request action for audit.
          Only staff with <code>request.act</code> permission may change priority.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current priority display */}
          <div className="space-y-1">
            <Label>Current priority</Label>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${currentLabel.color}`}
              >
                {currentLabel.en} / {currentLabel.ar}
              </span>
            </div>
          </div>

          <Separator />

          {/* New priority dropdown */}
          <div className="space-y-1">
            <Label htmlFor="priority">New priority <span className="text-destructive">*</span></Label>
            <select
              id="priority"
              className={selectClass}
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              disabled={isPending}
              required
            >
              <option value="">— select priority —</option>
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Selected priority preview */}
          <div className="space-y-1">
            <Label>Selected priority</Label>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${selectedLabel.color}`}
              >
                {selectedLabel.en} / {selectedLabel.ar}
              </span>
            </div>
          </div>

          <Separator />

          {/* Reason */}
          <div className="space-y-1">
            <Label htmlFor="reason">Reason for change <span className="text-destructive">*</span></Label>
            <textarea
              id="reason"
              className={textareaClass}
              placeholder="Explain why the priority is being changed (medical case, external deadline, etc.)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isPending}
              required
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {reason.length}/500 characters (minimum 10)
            </p>
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? 'Changing…' : 'Change Priority'}
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