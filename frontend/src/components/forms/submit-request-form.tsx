'use client';
// src/components/forms/submit-request-form.tsx
//
// Embeddable in a Dialog (see requests/page.tsx) rather than a full page —
// file upload, if any, is deliberately held in memory and only sent AFTER
// the request itself is created: UploadDocumentHandler requires an existing
// request row (`findById` throws EntityNotFoundError otherwise), so there is
// no way to upload before submit succeeds. This is a backend constraint, not
// a UI choice.

import { useState } from 'react';
import { useSubmitRequest } from '@/lib/hooks/use-requests';
import { useUploadDocument } from '@/lib/hooks/use-requests';
import { SubmitRequestDto } from '@/types/request';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const textareaClass =
  'flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export function SubmitRequestForm({ onSuccess, onCancel }: Props) {
  const submitRequest = useSubmitRequest();
  const uploadDocument = useUploadDocument();

  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Distinct from submitError: the request WAS created, only the attachment
  // failed — must not be presented as "nothing happened."
  const [partialFailure, setPartialFailure] = useState<string | null>(null);

  const isPending = submitRequest.isPending || uploadDocument.isPending;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setSubmitError('File must be 10 MB or smaller.');
      return;
    }
    setFile(f);
    setSubmitError(null);
    e.target.value = ''; // allow re-selecting the same file after removing it
  }

  async function handleSubmit() {
    setSubmitError(null);

    if (!rawText.trim()) {
      setSubmitError('Please describe your request.');
      return;
    }
    if (rawText.length > 1000) {
      setSubmitError('Request text must be 1000 characters or fewer.');
      return;
    }

    const request: SubmitRequestDto = { rawText: rawText.trim() };

    try {
      const result = await submitRequest.mutateAsync(request);

      if (file) {
        try {
          const contentBase64 = await fileToBase64(file);
          await uploadDocument.mutateAsync({
            id: result.id,
            request: {
              fileName: file.name,
              mimeType: file.type || 'application/octet-stream',
              contentBase64,
            },
          });
        } catch {
          setPartialFailure(
            `Your request (Ref# ${result.referenceNo}) was submitted, but the attached file failed to upload. You can add it again later.`
          );
          return; // wait for explicit acknowledgement — see below
        }
      }

      onSuccess();
    } catch {
      setSubmitError('Failed to submit request. Please try again.');
    }
  }

  if (partialFailure) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{partialFailure}</p>
        <Button onClick={onSuccess}>OK</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="rawText">What do you need help with? <span className="text-destructive">*</span></Label>
        <textarea
          id="rawText"
          className={textareaClass}
          placeholder="Describe your request in detail..."
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          disabled={isPending}
          maxLength={1000}
          rows={6}
        />
        <p className="text-xs text-muted-foreground">{rawText.length}/1000 characters</p>
      </div>

      <div className="space-y-1">
        <Label>Attachment (optional)</Label>
        {file ? (
          <div className="flex items-center gap-2 text-sm rounded-md border px-3 py-2">
            <span className="truncate flex-1">{file.name}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              disabled={isPending}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
        ) : (
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('submit-request-file-input')?.click()}
              disabled={isPending}
            >
              Attach File
            </Button>
            <input
              id="submit-request-file-input"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={isPending}
            />
          </div>
        )}
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Submitting…' : 'Submit'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}