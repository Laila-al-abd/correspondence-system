'use client';
// src/components/forms/eligibility-rule-delete-button.tsx
//
// Inline delete button for an eligibility rule.
// DELETE /access/templates/:templateId/eligibility-rules/:ruleId
//
// Single-field, low-complexity mutation → small inline control (not a full Card form).
// Follows the pattern: Button + useRemoveEligibilityRule mutation,
// confirms via lightweight two-click toggle state (consistent with inline error pattern).

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useRemoveEligibilityRule } from '@/lib/hooks/use-access';
import { Button } from '@/components/ui/button';

interface Props {
  /** The template ID (from parent context). */
  templateId: string;
  /** The rule ID to delete. */
  ruleId: string;
  /** Optional custom button text. */
  children?: ReactNode;
  /** Optional custom className for styling. */
  className?: string;
  /** Optional callback after successful deletion (for side effects). */
  onSuccess?: () => void;
}

export function EligibilityRuleDeleteButton({
  templateId,
  ruleId,
  children,
  className,
  onSuccess,
}: Props) {
  const removeRule = useRemoveEligibilityRule(templateId);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setShowConfirm(false);
    setError(null);
    try {
      await removeRule.mutateAsync(ruleId);
      onSuccess?.();
    } catch {
      setError('Failed to delete rule. Please try again.');
    }
  }

  function handleClick() {
    if (removeRule.isPending) return;
    setShowConfirm(true);
    setError(null);
  }

  if (showConfirm) {
    return (
      <span className="flex items-center gap-1">
        <Button variant="destructive" size="icon" onClick={handleConfirm} disabled={removeRule.isPending} title="Confirm delete">
          ✓
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowConfirm(false)} disabled={removeRule.isPending} title="Cancel">
          ✕
        </Button>
        {error && <p className="text-sm text-destructive whitespace-nowrap">{error}</p>}
      </span>
    );
  }

  return (
    <>
      <Button
        variant="destructive"
        size="icon"
        onClick={handleClick}
        disabled={removeRule.isPending}
        className={className}
        title="Delete rule"
      >
        {removeRule.isPending ? '⏳' : children ?? '🗑'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );
}