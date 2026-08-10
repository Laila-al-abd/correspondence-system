'use client';

// src/components/forms/classify-by-human-form.tsx
//
// Form for human classification of a request (HITL resolver).
// POST /requests/:id/classify/human
//
// Notes:
// - Staff member selects the correct template and optionally fills the form.
// - templateId is required (dropdown from active templates).
// - filledData is optional initial values for the form -- this is a PARTIAL
//   fill (backend validates via Template.validatePartial), not the final
//   submission, so individual fields must never be HTML-required here even
//   when the template marks them isRequired. That constraint belongs to the
//   confirm step, where the backend enforces it with validateFilledData.
// - Requires 'request.classify' permission.
// - Current user ID comes from auth context.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClassifyByHuman } from '@/lib/hooks/use-requests';
import { useTemplates as useTemplateHook } from '@/lib/hooks/use-template';
import { ClassifyByHumanDto } from '@/types/request';
import { TemplateCatalogView, TemplateFieldCatalogView } from '@/types/catalog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

interface Props {
  /** The request ID being classified. */
  requestId: string;
}

export function ClassifyByHumanForm({ requestId }: Props) {
  const router = useRouter();
  const classifyByHuman = useClassifyByHuman();
  const { data: templatesData } = useTemplateHook(true); // includeActive = true

  const templates: TemplateCatalogView[] = templatesData ?? [];
  const [templateId, setTemplateId] = useState('');
  const [filledData, setFilledData] = useState<Record<string, unknown>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedTemplate = templates.find((t) => t.id === templateId);
  const isPending = classifyByHuman.isPending;

  // When template changes, reset filledData (new template = new fields)
  useEffect(() => {
    setFilledData({});
  }, [templateId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!templateId) {
      setSubmitError('Template is required.');
      return;
    }

    const request: ClassifyByHumanDto = {
      templateId,
      filledData: Object.keys(filledData).length > 0 ? filledData : undefined,
    };

    try {
      await classifyByHuman.mutateAsync({ id: requestId, request });
      router.push(`/dashboard/requests/${requestId}`);
    } catch {
      setSubmitError('Failed to classify request. Please check the values and try again.');
    }
  }

  function handleFilledDataChange(key: string, value: unknown) {
    setFilledData((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Classify Request (Human Review)</CardTitle>
        <CardDescription>
          Select the correct template for this request. You may also pre-fill the form
          values before sending it back to the requester for confirmation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template dropdown -- this one stays required: it's not part of
              filledData and the DTO's templateId is non-optional. */}
          <div className="space-y-2">
            <Label htmlFor="templateId">Template</Label>
            <select
              id="templateId"
              className={selectClass}
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              disabled={isPending}
              required
            >
              <option value="">— select template —</option>
              {templates
                .filter((t) => t.isActive)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nameAr}
                    {t.nameEn && ` (${t.nameEn})`}
                    {t.code && ` [${t.code}]`}
                  </option>
                ))}
            </select>
            {templates.length === 0 && (
              <p className="text-sm text-muted-foreground">No active templates available.</p>
            )}
          </div>

          <Separator />

          {/* Dynamic form fields based on selected template */}
          {selectedTemplate && selectedTemplate.fields.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">
                Form for &quot;{selectedTemplate.nameAr}&quot; ({selectedTemplate.fields.length}{' '}
                fields)
              </h4>
              {selectedTemplate.fields.map((field: TemplateFieldCatalogView) => (
                <div key={field.key}>
                  {renderFieldInput(
                    field,
                    filledData[field.key],
                    handleFilledDataChange,
                    isPending,
                    field.isRequired,
                  )}
                </div>
              ))}
            </div>
          )}

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? 'Classifying…' : 'Classify Request'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/requests/${requestId}`)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Shared field renderer (duplicated from confirm-request-form for now).
//
// NOTE: this copy is for the CLASSIFY step, which is a partial fill
// (backend: Template.validatePartial). Inputs are therefore never
// HTML-required here, even for fields the template marks isRequired -- the
// admin may legitimately submit having answered only some of them. The `*`
// label marker is kept so it's still visually clear which fields the
// requester will eventually have to answer at confirm time. If you copy this
// into confirm-request-form, restore `required={isRequired}` there: that step
// validates with the full Template.validateFilledData and genuinely requires
// every required field.
function renderFieldInput(
  field: TemplateFieldCatalogView,
  value: unknown,
  onChange: (key: string, value: unknown) => void,
  disabled: boolean,
  isRequired: boolean,
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
        <Label htmlFor={field.key}>
          {field.labelAr}
          {field.labelEn && ` (${field.labelEn})`}
          {isRequired && <span className="text-destructive"> *</span>}
        </Label>
      </div>
    );
  }

  if (isEnum) {
    return (
      <div className="space-y-2">
        <Label htmlFor={field.key}>
          {field.labelAr}
          {field.labelEn && ` (${field.labelEn})`}
          {isRequired && <span className="text-destructive"> *</span>}
        </Label>
        <select
          id={field.key}
          className={selectClass}
          value={String(fieldValue)}
          onChange={(e) => onChange(field.key, e.target.value || undefined)}
          disabled={disabled}
          // Fix: no `required` here -- this is a partial fill (classify step),
          // and an HTML-required control blocks native form submission before
          // handleSubmit ever runs, even though the backend's validatePartial
          // happily accepts this field being left unanswered.
        >
          <option value="">— select —</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.labelAr}
              {opt.labelEn && ` (${opt.labelEn})`}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // TEXT, NUMBER, DATE
  const inputType =
    field.dataType === 'DATE' ? 'date' : field.dataType === 'NUMBER' ? 'number' : 'text';

  return (
    <div className="space-y-2">
      <Label htmlFor={field.key}>
        {field.labelAr}
        {field.labelEn && ` (${field.labelEn})`}
        {isRequired && <span className="text-destructive"> *</span>}
      </Label>
      <Input
        id={field.key}
        type={inputType}
        value={String(fieldValue)}
        onChange={(e) => {
          // Bonus: send NUMBER fields as actual numbers rather than strings.
          // Not required for correctness -- Template.validate() coerces via
          // Number(value) either way -- but it keeps the payload's types
          // matching what the field declares.
          let val: string | number | undefined = e.target.value;
          if (inputType === 'number' && val !== '') {
            val = Number(val);
          }
          onChange(field.key, val);
        }}
        disabled={disabled}
        // Fix: no `required` here, same reasoning as the <select> above.
        maxLength={field.dataType === 'TEXT' ? 1000 : undefined}
      />
    </div>
  );
}