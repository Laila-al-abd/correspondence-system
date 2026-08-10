'use client';
// src/components/forms/confirm-request-form.tsx
//
// Form for confirming or disputing a request classification.
// POST /requests/:id/confirm
//
// Notes:
// - The requester accepts or rejects the proposed template and filled data.
// - outcome is required: 'CONFIRM' or 'DISPUTE'.
// - filledData is optional corrections the requester made.
// - No permission decorator (personal route): handler checks ownership.
// - Current user ID comes from auth context, not from the body.

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useConfirmRequest } from '@/lib/hooks/use-requests';
import { ConfirmRequestDto, ConfirmOutcome, TemplateFormView } from '@/types/request';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

interface Props {
  /** The request ID being confirmed. */
  requestId: string;
  /** The template form view (for rendering field inputs). */
  template: TemplateFormView;
  /** Current filled data from the request. */
  filledData: Record<string, unknown>;
  /** Missing required field keys. */
  missingRequiredFields: string[];
  /** Optional existing confirmation to edit — not used (confirm is one-shot). */
  existing?: never;
}

function renderFieldInput(
  field: TemplateFormView['fields'][0],
  value: unknown,
  onChange: (key: string, value: unknown) => void,
  disabled: boolean,
  isMissingRequired: boolean
) {
  const fieldValue = value ?? '';
  const isEnum = field.options.length > 0;

  if (field.dataType === 'BOOLEAN') {
    return (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={field.key}
          checked={fieldValue === true || fieldValue === 'true'}
          onChange={(e) => onChange(field.key, e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
        />
        <Label htmlFor={field.key} className="cursor-pointer mb-0">
          {field.labelAr}{field.labelEn && ` (${field.labelEn})`}
        </Label>
        {isMissingRequired && <span className="text-destructive text-sm">*</span>}
      </div>
    );
  }

  if (isEnum) {
    return (
      <div className="space-y-1">
        <Label htmlFor={field.key}>
          {field.labelAr}{field.labelEn && ` (${field.labelEn})`}
          {field.isRequired && <span className="text-destructive">*</span>}
        </Label>
        <select
          id={field.key}
          className={selectClass}
          value={String(fieldValue)}
          onChange={(e) => onChange(field.key, e.target.value || undefined)}
          disabled={disabled}
          required={field.isRequired}
        >
          <option value="">— select —</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.labelAr}{opt.labelEn && ` (${opt.labelEn})`}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // TEXT, NUMBER, DATE
  const inputType = field.dataType === 'DATE' ? 'date' : field.dataType === 'NUMBER' ? 'number' : 'text';
  return (
    <div className="space-y-1">
      <Label htmlFor={field.key}>
        {field.labelAr}{field.labelEn && ` (${field.labelEn})`}
        {field.isRequired && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={field.key}
        type={inputType}
        value={String(fieldValue)}
        onChange={(e) => onChange(field.key, e.target.value)}
        disabled={disabled}
        required={field.isRequired}
        maxLength={field.dataType === 'TEXT' ? 1000 : undefined}
      />
    </div>
  );
}

export function ConfirmRequestForm({
  requestId,
  template,
  filledData,
  missingRequiredFields,
  existing,
}: Props) {
  const router = useRouter();
  const confirmRequest = useConfirmRequest();

  const [outcome, setOutcome] = useState<ConfirmOutcome>('CONFIRM');
  const [formValues, setFormValues] = useState<Record<string, unknown>>(filledData ?? {});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPending = confirmRequest.isPending;

  function handleFieldChange(key: string, value: unknown) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  function getMissingCount(): number {
    return template.fields.filter((f) => f.isRequired).filter((f) => {
      const val = formValues[f.key];
      return val === null || val === undefined || val === '';
    }).length;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    // Validate required fields if confirming
    if (outcome === 'CONFIRM') {
      const missing = template.fields
        .filter((f) => f.isRequired)
        .filter((f) => {
          const val = formValues[f.key];
          return val === null || val === undefined || val === '';
        })
        .map((f) => f.key);

      if (missing.length > 0) {
        setSubmitError(`Please fill in all required fields: ${missing.join(', ')}`);
        return;
      }
    }

    const request: ConfirmRequestDto = {
      outcome,
      filledData: outcome === 'CONFIRM' ? formValues : undefined,
    };

    try {
      await confirmRequest.mutateAsync({ id: requestId, request });
      router.push(`/dashboard/requests/${requestId}`);
    } catch {
      setSubmitError('Failed to confirm request. Please try again.');
    }
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>
          {outcome === 'CONFIRM' ? 'Confirm Request' : 'Dispute Classification'}
        </CardTitle>
        <CardDescription>
          {outcome === 'CONFIRM'
            ? `Review the classified template "${template.titleAr}" and confirm or correct the values.`
            : 'Reject the proposed classification. The request will return to the queue for manual review.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Outcome selector */}
          <div className="space-y-1">
            <Label>Your response <span className="text-destructive">*</span></Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="outcome"
                  value="CONFIRM"
                  checked={outcome === 'CONFIRM'}
                  onChange={() => setOutcome('CONFIRM')}
                  disabled={isPending}
                  className="h-4 w-4 border-input text-primary focus:ring-primary"
                />
                <span>Confirm — the template and values are correct</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="outcome"
                  value="DISPUTE"
                  checked={outcome === 'DISPUTE'}
                  onChange={() => setOutcome('DISPUTE')}
                  disabled={isPending}
                  className="h-4 w-4 border-input text-primary focus:ring-primary"
                />
                <span>Dispute — this is the wrong template</span>
              </label>
            </div>
          </div>

          <Separator />

          {/* Form fields (only shown when confirming) */}
          {outcome === 'CONFIRM' && (
            <>
              <div className="space-y-4">
                {template.fields.map((field) => (
                  <div key={field.key}>
                    {renderFieldInput(
                      field,
                      formValues[field.key],
                      handleFieldChange,
                      isPending,
                      missingRequiredFields.includes(field.key)
                    )}
                  </div>
                ))}
              </div>

              {getMissingCount() > 0 && (
                <p className="text-sm text-destructive">
                  {getMissingCount()} required field{getMissingCount() > 1 ? 's' : ''} remaining
                </p>
              )}
            </>
          )}

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? 'Processing…' : outcome === 'CONFIRM' ? 'Confirm Request' : 'Dispute Classification'}
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