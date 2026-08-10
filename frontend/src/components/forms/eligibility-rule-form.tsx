'use client';
// src/components/forms/eligibility-rule-form.tsx
//
// Form for adding an ABAC eligibility rule to a template.
// POST /access/templates/:templateId/eligibility-rules
//
// Notes:
// - attributeCode is a STRING CODE (e.g. "user_type"), not a UUID.
//   The backend resolves it via AttributeDefinitionRepository.findByCode().
//   A real listing endpoint exists (GET /access/attributes) → dropdown (Case a).
// - value is arbitrary JSON validated per-operator in the handler:
//     IN       → array (e.g. ["STAFF", "FACULTY"])
//     GTE/LTE  → number
//     EQ/NEQ   → any scalar (string, number, boolean)
//   We render a conditional input that adapts to the selected operator.

import { useState, FormEvent } from 'react';
import { useAddEligibilityRule, useAccessAttributes } from '@/lib/hooks/use-access';
import {
  AddEligibilityRuleDto,
  EligibilityOperator,
  AttributeDefinitionView,
} from '@/types/access';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

interface Props {
  /** The template ID this rule will be attached to (from parent context). */
  templateId: string;
}

export function EligibilityRuleForm({ templateId }: Props) {
  const addRule = useAddEligibilityRule(templateId);
  const { data: attributes } = useAccessAttributes();

  const [attributeCode, setAttributeCode] = useState<string>('');
  const [operator, setOperator] = useState<EligibilityOperator>(EligibilityOperator.EQ);
  const [value, setValue] = useState<string>(''); // raw input, parsed on submit
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedAttribute = attributes?.find((a) => a.code === attributeCode);
  const isPending = addRule.isPending;

  // ---- Helpers for value input rendering/parsing ----

  function parseValueForOperator(op: EligibilityOperator, raw: string): unknown {
    const trimmed = raw.trim();
    if (!trimmed) return '';

    if (op === EligibilityOperator.IN) {
      // Expect JSON array or comma-separated values
      try {
        const parsed = JSON.parse(trimmed);
        if (!Array.isArray(parsed)) throw new Error('Not an array');
        return parsed;
      } catch {
        // Fallback: comma-separated
        return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    if (op === EligibilityOperator.GTE || op === EligibilityOperator.LTE) {
      const num = Number(trimmed);
      if (Number.isNaN(num)) throw new Error('Numeric value required');
      return num;
    }
    // EQ, NEQ: try JSON for booleans/numbers, otherwise string
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  // We don't support editing existing rules (no PATCH route), so no prefill.

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!attributeCode) {
      setSubmitError('Attribute is required.');
      return;
    }
    if (!value.trim()) {
      setSubmitError('Value is required.');
      return;
    }

    let parsedValue: unknown;
    try {
      parsedValue = parseValueForOperator(operator, value);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Invalid value format for this operator.');
      return;
    }

    // Additional client-side validation matching backend @Length(1, 100)
    if (attributeCode.length > 100) {
      setSubmitError('Attribute code must be 100 characters or fewer.');
      return;
    }

    const request: AddEligibilityRuleDto = {
      attributeCode,
      operator,
      value: parsedValue,
    };

    try {
      await addRule.mutateAsync(request);
      // Success — navigation handled by parent (template detail page stays open, list auto-refreshes via query invalidation)
      setValue('');
    } catch {
      // TanStack Query normalizes errors; accessApi throws ApiError with .code
      // We just show a generic message; toast/alert can be added if needed.
      setSubmitError('Failed to add rule. Please check the values and try again.');
    }
  }

  // ---- Value input per operator ----

  function ValueInput() {
    const attr = selectedAttribute;
    const isArrayOp = operator === EligibilityOperator.IN;
    const isNumericOp = operator === EligibilityOperator.GTE || operator === EligibilityOperator.LTE;

    const placeholder =
      isArrayOp
        ? 'JSON array e.g. ["STAFF", "FACULTY"] or comma-separated: STAFF, FACULTY'
        : isNumericOp
        ? 'Numeric value (e.g. 3.5)'
        : 'Value (string, number, boolean, or JSON)';

    const hint =
      isArrayOp
        ? 'Enter a JSON array or comma-separated values.'
        : isNumericOp
        ? 'Enter a number. Decimals allowed.'
        : 'Enter a scalar value. For booleans use true/false. For numbers just type the number. Strings can be bare or quoted JSON.';

    const formatHint = attr
      ? `Attribute “${attr.code}” expects ${attr.dataType.toLowerCase()} values.`
      : 'Select an attribute first to see expected format.';

    return (
      <div className="space-y-1">
        <Label htmlFor="value">Value</Label>
        <textarea
          id="value"
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">{hint}</p>
        <p className="text-xs text-muted-foreground">{formatHint}</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Add Eligibility Rule</CardTitle>
        <CardDescription>
          Define an attribute-based access control rule for this template. Users must satisfy
          all rules to be eligible to submit requests from this template.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Attribute dropdown — Case (a): real listing endpoint exists */}
          <div className="space-y-1">
            <Label htmlFor="attributeCode">Attribute <span className="text-destructive">*</span></Label>
            <select
              id="attributeCode"
              className={selectClass}
              value={attributeCode}
              onChange={(e) => setAttributeCode(e.target.value)}
              disabled={isPending}
              required
            >
              <option value="">— select attribute —</option>
              {attributes?.map((attr) => (
                <option key={attr.code} value={attr.code}>
                  {attr.code} — {attr.label.ar} {attr.label.en && `(${attr.label.en})`}
                </option>
              ))}
            </select>
            {attributeCode && selectedAttribute && (
              <p className="text-sm text-muted-foreground">
                <strong>Type:</strong> {selectedAttribute.dataType}
                {selectedAttribute.description && (
                  <>
                    {' | '}
                    <strong>Description:</strong>{' '}
                    {selectedAttribute.description.ar}
                    {selectedAttribute.description.en && ` (${selectedAttribute.description.en})`}
                  </>
                )}
              </p>
            )}
          </div>

          <Separator />

          {/* Operator */}
          <div className="space-y-1">
            <Label htmlFor="operator">Operator <span className="text-destructive">*</span></Label>
            <select
              id="operator"
              className={selectClass}
              value={operator}
              onChange={(e) => setOperator(e.target.value as EligibilityOperator)}
              disabled={isPending}
              required
            >
              {Object.values(EligibilityOperator).map((op) => (
                <option key={op} value={op}>
                  {op}
                  {' '}
                  {op === EligibilityOperator.EQ && '(equals)'}
                  {op === EligibilityOperator.NEQ && '(not equals)'}
                  {op === EligibilityOperator.IN && '(in array)'}
                  {op === EligibilityOperator.GTE && '(≥ greater or equal)'}
                  {op === EligibilityOperator.LTE && '(≤ less or equal)'}
                </option>
              ))}
            </select>
          </div>

          {/* Value — conditional input */}
          <ValueInput />

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? 'Adding…' : 'Add Rule'}
            </Button>
            {/* Cancel just clears the form; parent manages page navigation */}
            <Button type="button" variant="outline" onClick={() => { setAttributeCode(''); setOperator(EligibilityOperator.EQ); setValue(''); setSubmitError(null); }} disabled={isPending}>
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}