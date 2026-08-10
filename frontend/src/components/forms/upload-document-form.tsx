'use client';
// src/components/forms/upload-document-form.tsx
//
// Form for uploading a document to a request.
// POST /requests/:id/documents
//
// Notes:
// - fileName: original file name.
// - mimeType: MIME type (e.g., application/pdf).
// - contentBase64: base64-encoded file content.
// - docKind: optional, UPLOADED or GENERATED (defaults to UPLOADED).
// - requestActionId: optional, links document to a specific step action.
// - ocrText: optional extracted text from OCR.
// - Current user ID (uploaderId) comes from auth context.
// - This is typically used by requesters adding attachments or staff adding generated docs.

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useUploadDocument } from '@/lib/hooks/use-requests';
import { UploadDocumentDto, UploadDocumentResponse, DocKind } from '@/types/request';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

const textareaClass =
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

interface Props {
  /** The request ID. */
  requestId: string;
  /** Optional existing upload to edit — not used (upload is one-shot). */
  existing?: never;
  /** Optional callback after successful upload. */
  onSuccess?: (response: UploadDocumentResponse) => void;
}

export function UploadDocumentForm({ requestId, existing, onSuccess }: Props) {
  const router = useRouter();
  const uploadDocument = useUploadDocument();

  const [fileName, setFileName] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('application/pdf');
  const [contentBase64, setContentBase64] = useState<string>('');
  const [docKind, setDocKind] = useState<DocKind>(DocKind.UPLOADED);
  const [requestActionId, setRequestActionId] = useState<string>('');
  const [ocrText, setOcrText] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPending = uploadDocument.isPending;

  // File input handler (converts to base64)
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setSubmitError('File must be 10 MB or smaller.');
      return;
    }

    setFileName(file.name);
    setMimeType(file.type || 'application/octet-stream');

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setContentBase64(base64);
      setSubmitError(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!fileName.trim()) {
      setSubmitError('File is required.');
      return;
    }
    if (!contentBase64) {
      setSubmitError('File content is required.');
      return;
    }
    if (!mimeType.trim()) {
      setSubmitError('MIME type is required.');
      return;
    }
    if (requestActionId.length > 0 && requestActionId.length !== 36) {
      // UUID validation (basic length check)
      setSubmitError('Request action ID must be a valid UUID.');
      return;
    }
    if (ocrText.length > 50000) {
      setSubmitError('OCR text must be 50,000 characters or fewer.');
      return;
    }

    const request: UploadDocumentDto = {
      fileName: fileName.trim(),
      mimeType: mimeType.trim(),
      contentBase64,
      docKind: docKind || undefined,
      requestActionId: requestActionId.trim() || undefined,
      ocrText: ocrText.trim() || undefined,
    };

    try {
      const response = await uploadDocument.mutateAsync({ id: requestId, request });
      onSuccess?.(response);
      router.push(`/dashboard/requests/${requestId}`);
    } catch {
      setSubmitError('Failed to upload document. Please try again.');
    }
  }

  function handleFileInputClick() {
    const input = document.getElementById('file-input') as HTMLInputElement;
    input?.click();
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Attach a file to this request. Max file size: 10 MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File input */}
          <div className="space-y-1">
            <Label htmlFor="file-input">File <span className="text-destructive">*</span></Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleFileInputClick}
                disabled={isPending}
              >
                Choose File
              </Button>
              <span className="text-sm text-muted-foreground">
                {fileName || 'No file selected'}
              </span>
              <input
                id="file-input"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={isPending}
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              />
            </div>
            {fileName && (
              <p className="text-xs text-muted-foreground">
                MIME type: {mimeType} | Size: ~{(contentBase64.length * 0.75 / 1024).toFixed(1)} KB (base64)
              </p>
            )}
          </div>

          <Separator />

          {/* Document kind */}
          <div className="space-y-1">
            <Label htmlFor="docKind">Document kind</Label>
            <select
              id="docKind"
              className={selectClass}
              value={docKind}
              onChange={(e) => setDocKind(e.target.value as DocKind)}
              disabled={isPending}
            >
              <option value={DocKind.UPLOADED}>UPLOADED — User-provided attachment</option>
              <option value={DocKind.GENERATED}>GENERATED — System-generated document</option>
            </select>
          </div>

          {/* Request action ID (optional) */}
          <div className="space-y-1">
            <Label htmlFor="requestActionId">Linked step action ID (optional)</Label>
            <Input
              id="requestActionId"
              type="text"
              value={requestActionId}
              onChange={(e) => setRequestActionId(e.target.value)}
              disabled={isPending}
              placeholder="UUID of request action this document relates to"
              maxLength={36}
            />
            <p className="text-xs text-muted-foreground">
              Associate this document with a specific workflow step action.
            </p>
          </div>

          {/* OCR text (optional) */}
          <div className="space-y-1">
            <Label htmlFor="ocrText">OCR extracted text (optional)</Label>
            <textarea
              id="ocrText"
              className={textareaClass}
              placeholder="Text extracted from the document via OCR..."
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              disabled={isPending}
              maxLength={50000}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              {ocrText.length}/50,000 characters
            </p>
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending || !fileName} className="w-full sm:w-auto">
              {isPending ? 'Uploading…' : 'Upload Document'}
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