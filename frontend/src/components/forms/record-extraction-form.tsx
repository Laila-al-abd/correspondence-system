'use client';
// src/components/forms/record-extraction-form.tsx
//
// Form for recording extraction results (NLP extractor posts results).
// PATCH /requests/:id/filled-data
//
// Notes:
// - Requires 'request.classify' permission.
// - filledData is partial — the extractor sends what it found, not the whole form.
// - abstained: optional array of field keys the model couldn't confidently extract.
// - extractionMeta: optional per-field metadata (raw text span, confidence score).
// - modelVersion: required, identifies the extractor model version.
// - Current user ID comes from auth context (the extractor service account).
// - This is typically called by an automated service, but a human can use it too.

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useRecordExtraction } from '@/lib/hooks/use-requests';
import { RecordExtractionDto, ExtractionMetaDto } from '@/types/request';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const textareaClass =
  'flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

interface Props {
  /** The request ID being updated. */
  requestId: string;
  /** Optional existing extraction to edit — not used (extraction is append-only merge). */
  existing?: never;
}

export function RecordExtractionForm({ requestId, existing }: Props) {
  const router = useRouter();
  const recordExtraction = useRecordExtraction();

  const [filledDataJson, setFilledDataJson] = useState<string>('{}');
  const [abstainedJson, setAbstainedJson] = useState<string>('[]');
  const [extractionMetaJson, setExtractionMetaJson] = useState<string>('{}');
  const [modelVersion, setModelVersion] = useState<string>('');
  const [nullThreshold, setNullThreshold] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPending = recordExtraction.isPending;

  function parseJsonOrNull<T>(json: string, fallback: T): T {
    try {
      const parsed = JSON.parse(json);
      return parsed;
    } catch {
      return fallback;
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!modelVersion.trim()) {
      setSubmitError('Model version is required.');
      return;
    }
    if (modelVersion.length > 50) {
      setSubmitError('Model version must be 50 characters or fewer.');
      return;
    }

    const filledData = parseJsonOrNull(filledDataJson, {} as Record<string, unknown>);
    const abstained = parseJsonOrNull(abstainedJson, [] as string[]);
    const extractionMeta = parseJsonOrNull(extractionMetaJson, {} as Record<string, ExtractionMetaDto>);

    if (typeof filledData !== 'object' || filledData === null || Array.isArray(filledData)) {
      setSubmitError('filledData must be a JSON object.');
      return;
    }
    if (!Array.isArray(abstained)) {
      setSubmitError('abstained must be a JSON array of strings.');
      return;
    }
    if (typeof extractionMeta !== 'object' || extractionMeta === null || Array.isArray(extractionMeta)) {
      setSubmitError('extractionMeta must be a JSON object.');
      return;
    }

    // Validate threshold if provided
    let parsedThreshold: number | undefined;
    if (nullThreshold.trim()) {
      parsedThreshold = parseFloat(nullThreshold);
      if (isNaN(parsedThreshold) || parsedThreshold < 0 || parsedThreshold > 1) {
        setSubmitError('Null threshold must be a number between 0 and 1.');
        return;
      }
    }

    const request: RecordExtractionDto = {
      filledData,
      abstained: abstained.length > 0 ? abstained : undefined,
      extractionMeta: Object.keys(extractionMeta).length > 0 ? extractionMeta : undefined,
      modelVersion: modelVersion.trim(),
      nullThreshold: parsedThreshold,
    };

    try {
      await recordExtraction.mutateAsync({ id: requestId, request });
      router.push(`/dashboard/requests/${requestId}`);
    } catch {
      setSubmitError('Failed to record extraction. Please check the JSON and try again.');
    }
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Record Extraction Results</CardTitle>
        <CardDescription>
          Submit partial form values extracted from the requester's text. This merges with
          any existing filled data. The model version is required for audit trail.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* filledData (JSON) */}
          <div className="space-y-1">
            <Label htmlFor="filledData">Extracted field values (JSON) <span className="text-destructive">*</span></Label>
            <textarea
              id="filledData"
              className={textareaClass}
              placeholder='{"field_key": "value", "other_field": 123}'
              value={filledDataJson}
              onChange={(e) => setFilledDataJson(e.target.value)}
              disabled={isPending}
              required
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Partial object — only include fields the model confidently extracted.
            </p>
          </div>

          {/* abstained (JSON array) */}
          <div className="space-y-1">
            <Label htmlFor="abstained">Abstained fields (JSON array, optional)</Label>
            <textarea
              id="abstained"
              className={textareaClass}
              placeholder='["field_key_1", "field_key_2"]'
              value={abstainedJson}
              onChange={(e) => setAbstainedJson(e.target.value)}
              disabled={isPending}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Field keys the model could not confidently extract. These will be flagged as missing for the requester.
            </p>
          </div>

          {/* extractionMeta (JSON) */}
          <div className="space-y-1">
            <Label htmlFor="extractionMeta">Extraction metadata (JSON, optional)</Label>
            <textarea
              id="extractionMeta"
              className={textareaClass}
              placeholder='{"field_key": {"raw": "source text", "charStart": 10, "charEnd": 25, "score": 0.95}}'
              value={extractionMetaJson}
              onChange={(e) => setExtractionMetaJson(e.target.value)}
              disabled={isPending}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Per-field metadata: raw text span, character offsets, confidence score.
            </p>
          </div>

          <Separator />

          {/* Model version (required) */}
          <div className="space-y-1">
            <Label htmlFor="modelVersion">Model version <span className="text-destructive">*</span></Label>
            <Input
              id="modelVersion"
              type="text"
              value={modelVersion}
              onChange={(e) => setModelVersion(e.target.value)}
              disabled={isPending}
              required
              maxLength={50}
              placeholder="e.g., extractor-v2.3.1"
            />
            <p className="text-xs text-muted-foreground">Identifies the extractor model version (max 50 chars).</p>
          </div>

          {/* Null threshold (optional) */}
          <div className="space-y-1">
            <Label htmlFor="nullThreshold">Null threshold (optional)</Label>
            <Input
              id="nullThreshold"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={nullThreshold}
              onChange={(e) => setNullThreshold(e.target.value)}
              disabled={isPending}
              placeholder="0.5"
            />
            <p className="text-xs text-muted-foreground">Scores below this are treated as abstained (0.0–1.0).</p>
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? 'Recording…' : 'Record Extraction'}
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