'use client';
// src/components/forms/submit-request-form.tsx
//
// Form for submitting a new request.
// POST /requests
//
// Notes:
// - rawText is the user's free-text description of their request.
// - filledData is optional pre-filled form values (if the client already knows the template).
// - This is typically the first step: the user describes their need in free text,
//   then the system classifies it to a template.
// - No authentication permissions required on this route (it's the entry point).
// - Current user ID comes from the auth context (x-user-id header), not from the body.

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSubmitRequest } from '@/lib/hooks/use-requests';
import { SubmitRequestDto } from '@/types/request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const textareaClass =
  'flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

interface Props {
  /** Optional existing request to edit — not used (no update route for submission). */
  existing?: never;
}

export function SubmitRequestForm({ existing }: Props) {
  const router = useRouter();
  const submitRequest = useSubmitRequest();

  const [rawText, setRawText] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPending = submitRequest.isPending;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!rawText.trim()) {
      setSubmitError('Please describe your request.');
      return;
    }
    if (rawText.length > 1000) {
      setSubmitError('Request text must be 1000 characters or fewer.');
      return;
    }

    const request: SubmitRequestDto = {
      rawText: rawText.trim(),
    };

    try {
      const response = await submitRequest.mutateAsync(request);
      router.push(`/dashboard/requests/${response.id}`);
    } catch {
      setSubmitError('Failed to submit request. Please try again.');
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Submit New Request</CardTitle>
        <CardDescription>
          Describe your request in your own words. The system will match it to the
          appropriate form and workflow.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Free-text description */}
          <div className="space-y-1">
            <Label htmlFor="rawText">What do you need help with? <span className="text-destructive">*</span></Label>
            <textarea
              id="rawText"
              className={textareaClass}
              placeholder="Describe your request in detail..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              disabled={isPending}
              required
              maxLength={1000}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              {rawText.length}/1000 characters
            </p>
          </div>

          <Separator />

          {/* Optional: pre-filled form data (hidden by default, for advanced use) */}
          <details className="group">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Advanced: Pre-fill form data (JSON)
            </summary>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground">
                If you already know the template and its field keys, you can provide
                structured values here. This is optional — the system will classify
                your request and present the form for confirmation.
              </p>
            </div>
          </details>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? 'Submitting…' : 'Submit Request'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/requests')} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}