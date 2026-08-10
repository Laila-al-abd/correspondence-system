'use client';
// src/components/forms/confirm-payment-button.tsx
//
// Inline confirm payment button.
// POST /requests/:id/payments/:paymentId/confirm
//
// Notes:
// - Requires 'payment.settle' permission.
// - No request body — just records that this actor saw the payment.
// - Amount is not caller's to state; it was fixed when fee was raised.
// - Single-field, low-complexity mutation → small inline control.
// - Uses the standard inline error pattern with two-click confirmation.

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useConfirmPayment } from '@/lib/hooks/use-requests';
import { Button } from '@/components/ui/button';
import { ConfirmPaymentResponse } from '@/types/request';

interface Props {
  /** The request ID. */
  requestId: string;
  /** The payment ID to confirm. */
  paymentId: string;
  /** Optional custom button text. */
  children?: ReactNode;
  /** Optional custom className for styling. */
  className?: string;
  /** Optional callback after successful confirmation (for side effects). */
  onSuccess?: (response: ConfirmPaymentResponse) => void;
}

export function ConfirmPaymentButton({
  requestId,
  paymentId,
  children,
  className,
  onSuccess,
}: Props) {
  const confirmPayment = useConfirmPayment();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setShowConfirm(false);
    setError(null);
    try {
      const response = await confirmPayment.mutateAsync({ id: requestId, paymentId });
      onSuccess?.(response);
    } catch {
      setError('Failed to confirm payment. Please try again.');
    }
  }

  function handleClick() {
    if (confirmPayment.isPending) return;
    setShowConfirm(true);
    setError(null);
  }

  if (showConfirm) {
    return (
      <span className="flex items-center gap-1">
        <Button variant="default" size="icon" onClick={handleConfirm} disabled={confirmPayment.isPending} title="Confirm payment received">
          ✓
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowConfirm(false)} disabled={confirmPayment.isPending} title="Cancel">
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
        disabled={confirmPayment.isPending}
        className={className}
        title="Confirm payment"
      >
        {confirmPayment.isPending ? '⏳' : children ?? '✓ Confirm Payment'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );
}