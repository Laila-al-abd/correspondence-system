/**
 * Asks for a short-lived link to one document.
 *
 * The request id travels alongside the document id even though the document
 * knows its own request. It is not redundant: the caller reached this through
 * /requests/:id/documents/:documentId, and the handler refuses the pair if they
 * disagree. Without that check a document id guessed or remembered from another
 * request would be served under the authorization of a request the caller *is*
 * allowed to see.
 */
export class GetDocumentDownloadUrlQuery {
  constructor(
    public readonly requestId: string,
    public readonly documentId: string,
    public readonly requestedBy: string,
  ) {}
}
