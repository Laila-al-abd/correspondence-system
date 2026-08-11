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
// - Fix: when the selected attribute is ENUM and has real options (now that
//   AttributeDefinitionView.options is populated), EQ/NEQ render a <select>
//   and IN renders a checkbox group over those options, instead of forcing
//   the admin to hand-type raw JSON matching values they can't see. Both
//   write into the same `value` string state parseValueForOperator already
//   expects, so submit logic is unchanged. GTE/LTE are unaffected -- a fixed
//   option list has no natural ordering to compare against, so they keep the
//   numeric textarea regardless of attribute type.

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

  // True only when we can actually build real dropdown/checkbox controls --
  // an ENUM attribute with a real, non-empty option list. Anything else
  // (non-ENUM, or a legacy ENUM attribute with no options seeded) falls
  // through to the original free-text textarea.
  const hasEnumOptions =
    selectedAttribute?.dataType === 'ENUM' && selectedAttribute.options.length > 0;

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

  function handleAttributeChange(nextCode: string) {
    setAttributeCode(nextCode);
    // Stale raw-text/JSON from a previous attribute (e.g. a hand-typed
    // ["STAFF"] left over while switching to a numeric attribute) would
    // otherwise silently carry over and fail an operator it was never
    // meant for. Clearing on every attribute change keeps the value input
    // honestly empty for whatever control renders next.
    setValue('');
  }

  function handleOperatorChange(nextOp: EligibilityOperator) {
    setOperator(nextOp);
    setValue('');
  }

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

    // Real dropdown/checkboxes for an ENUM attribute with known options.
    if (hasEnumOptions && attr) {
      const sortedOptions = [...attr.options].sort((a, b) => a.ordinal - b.ordinal);

      if (isArrayOp) {
        // IN: checkbox group. `value` is kept as a JSON-stringified array so
        // parseValueForOperator's existing JSON.parse path handles it
        // unchanged on submit.
        let selected: string[] = [];
        try {
          const parsed = JSON.parse(value || '[]');
          if (Array.isArray(parsed)) selected = parsed;
        } catch {
          selected = [];
        }

        function toggle(optValue: string, checked: boolean) {
          const next = checked
            ? [...selected, optValue]
            : selected.filter((v) => v !== optValue);
          setValue(JSON.stringify(next));
        }

        return (
          <div className="space-y-1">
            <Label>Value <span className="text-destructive">*</span></Label>
            <div className="space-y-1.5 rounded-md border border-input p-3">
              {sortedOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.value)}
                    onChange={(e) => toggle(opt.value, e.target.checked)}
                    disabled={isPending}
                    className="h-4 w-4 rounded border-input"
                    style={{ accentColor: 'var(--ics-primary)' }}
                  />
                  <span>
                    {opt.label.ar}
                    {opt.label.en && ` (${opt.label.en})`}{' '}
                    <span className="text-muted-foreground">— {opt.value}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              User is eligible if their &quot;{attr.code}&quot; matches any checked option.
            </p>
          </div>
        );
      }

      if (!isNumericOp) {
        // EQ / NEQ: a single-select dropdown. `value` stays a bare string
        // (e.g. "BACHELOR") -- parseValueForOperator's EQ/NEQ branch already
        // falls through to returning the raw string when JSON.parse fails
        // on an unquoted identifier, so no change needed there.
        return (
          <div className="space-y-1">
            <Label htmlFor="value">Value <span className="text-destructive">*</span></Label>
            <select
              id="value"
              className={selectClass}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={isPending}
              required
            >
              <option value="">— select —</option>
              {sortedOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label.ar}
                  {opt.label.en && ` (${opt.label.en})`} — {opt.value}
                </option>
              ))}
            </select>
          </div>
        );
      }
      // Falls through to the textarea below for GTE/LTE on an ENUM
      // attribute -- an edge case with no natural ordering, left as free
      // entry rather than guessing at a comparison the domain doesn't define.
    }

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
      ? `Attribute “${attr.code}” expects ${attr.dataType.toLowerCase()} values.${
          attr.dataType === 'ENUM' ? ' (No options are configured for this attribute yet, so enter the value as text.)' : ''
        }`
      : 'Select an attribute first to see expected format.';

    return (
      <div className="space-y-1">
        <Label htmlFor="value">Value</Label>
        <textarea
          id="value"
          className="flex min-h-15 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
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
              onChange={(e) => handleAttributeChange(e.target.value)}
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
              onChange={(e) => handleOperatorChange(e.target.value as EligibilityOperator)}
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