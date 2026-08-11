'use client';
// src/components/forms/confirm-request-form.tsx
//
// The requester's verdict on a classified request. Two distinct actions, not
// a radio + single submit: Confirm validates required fields and accepts the
// proposal; Request Reclassification sends it back to human review with no
// validation (rejecting an extraction shouldn't require completing it first).
// The template itself is never editable here — only its name is shown.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConfirmRequest } from '@/lib/hooks/use-requests';
import { ConfirmRequestDto, TemplateFormView } from '@/types/request';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

interface Props {
  requestId: string;
  template: TemplateFormView;
  filledData: Record<string, unknown>;
  missingRequiredFields: string[];
}

function renderFieldInput(
  field: TemplateFormView['fields'][0],
  value: unknown,
  onChange: (key: string, value: unknown) => void,
  disabled: boolean,
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
        />
        <Label htmlFor={field.key} className="cursor-pointer mb-0">
          {field.labelAr}{field.labelEn && ` (${field.labelEn})`}
        </Label>
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
        maxLength={field.dataType === 'TEXT' ? 1000 : undefined}
      />
    </div>
  );
}

export function ConfirmRequestForm({ requestId, template, filledData, missingRequiredFields }: Props) {
  const router = useRouter();
  const confirmRequest = useConfirmRequest();

  const [formValues, setFormValues] = useState<Record<string, unknown>>(filledData ?? {});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isPending = confirmRequest.isPending;

  function handleFieldChange(key: string, value: unknown) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  async function submitOutcome(outcome: 'CONFIRM' | 'DISPUTE') {
    setSubmitError(null);

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
      setSuccessMessage(
        outcome === 'CONFIRM'
          ? 'Request confirmed successfully.'
          : 'Request sent back for reclassification.'
      );
    } catch {
      setSubmitError('Failed to submit your response. Please try again.');
    }
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>{template.titleAr}</CardTitle>
        <CardDescription>
          Review the values below and confirm, or request reclassification if this is the wrong
          template.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {template.fields.map((field) => (
            <div key={field.key}>
              {renderFieldInput(field, formValues[field.key], handleFieldChange, isPending)}
            </div>
          ))}
        </div>

        {missingRequiredFields.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {missingRequiredFields.length} required field{missingRequiredFields.length > 1 ? 's' : ''} still need attention.
          </p>
        )}

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <Separator />

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard/requests')} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" variant="outline" onClick={() => submitOutcome('DISPUTE')} disabled={isPending}>
            {isPending ? 'Processing…' : 'Request Reclassification'}
          </Button>
          <Button onClick={() => submitOutcome('CONFIRM')} disabled={isPending}>
            {isPending ? 'Processing…' : 'Confirm'}
          </Button>
        </div>
      </CardContent>

      <Dialog open={!!successMessage} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{successMessage}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => router.push('/dashboard/requests')}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}