'use client';

// src/components/forms/document-download-button.tsx
//
// Opens one attachment on a request.
// GET /requests/:id/documents/:documentId/download-url
//
// The request detail page has been rendering <DocumentDownloadButton> since the
// attachments card was written, and this file did not exist -- the identifier
// was never imported either, so the whole Documents card threw at render and
// nobody, requester or clerk, could open anything.
//
// The link is minted when the user clicks, never when the page loads. The API
// hands back a presigned URL: it is valid for one minute and carries its own
// authority, so asking for one per attachment on render would issue links
// nobody opens and spend most of their life before the user acted.

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useDocumentDownloadUrl } from '@/lib/hooks/use-requests';
import { Button } from '@/components/ui/button';

interface DocumentDownloadButtonProps {
  /** The request the document hangs off. */
  requestId: string;
  /** The document to open. */
  documentId: string;
  /** Optional label; defaults to "Download". */
  children?: ReactNode;
}

export function DocumentDownloadButton({
  requestId,
  documentId,
  children,
}: DocumentDownloadButtonProps) {
  // enabled: false -- nothing is fetched until the click below.
  const { refetch, isFetching } = useDocumentDownloadUrl(requestId, documentId, {
    enabled: false,
  });
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setError(null);
    try {
      // refetch() goes to the network regardless of staleTime, so each click
      // gets a link with its full minute rather than a cached one part-spent.
      const result = await refetch();
      const url = result.data?.url;
      if (!url) throw new Error('no download url returned');
      // Opened in a new tab rather than navigated to: the link points at the
      // object store, and replacing the current document would take the user
      // off the request they were reading.
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      setError('Could not open that file. Please try again.');
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isFetching}
      >
        {isFetching ? 'Preparing…' : children ?? 'Download'}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
