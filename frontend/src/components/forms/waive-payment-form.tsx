'use client';
// src/components/forms/waive-payment-form.tsx
//
// Form for waiving a payment.
// POST /requests/:id/payments/:paymentId/waive
//
// Notes:
// - Requires 'payment.settle' permission.
// - Reason is required, 10-500 characters (auditor reads this when asking why money was given up).
// - Current user ID (actorId) comes from auth context.
// - This is a destructive action (institute loses money) → requires reason.

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useWaivePayment } from '@/lib/hooks/use-requests';
import { WaivePaymentDto, WaivePaymentResponse } from '@/types/request';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const textareaClass =
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

interface Props {
  /** The request ID. */
  requestId: string;
  /** The payment ID to waive. */
  paymentId: string;
  /** Optional existing waiver to edit — not used (waiver is one-shot). */
  existing?: never;
  /** Optional callback after successful waiver. */
  onSuccess?: (response: WaivePaymentResponse) => void;
}

export function WaivePaymentForm({ requestId, paymentId, existing, onSuccess }: Props) {
  const router = useRouter();
  const waivePayment = useWaivePayment();

  const [reason, setReason] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPending = waivePayment.isPending;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

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

    const request: WaivePaymentDto = {
      reason: reason.trim(),
    };

    try {
      const response = await waivePayment.mutateAsync({ id: requestId, paymentId, request });
      onSuccess?.(response);
      router.push(`/dashboard/requests/${requestId}`);
    } catch {
      setSubmitError('Failed to waive payment. Please try again.');
    }
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-destructive">Waive Payment</CardTitle>
        <CardDescription>
          Drop the fee and let the request carry on as if it had been paid.
          A detailed reason is required and will be stored on the payment and as a request action
          for audit — this decision costs the institute money.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warning banner */}
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
            <strong>Warning:</strong> This action cannot be undone. The institute will not collect this fee.
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <Label htmlFor="reason">Reason for waiver <span className="text-destructive">*</span></Label>
            <textarea
              id="reason"
              className={textareaClass}
              placeholder="Explain why this fee is being waived (e.g., financial hardship, policy exception, error correction)"
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
            <Button type="submit" variant="destructive" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? 'Waiving…' : 'Waive Payment'}
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