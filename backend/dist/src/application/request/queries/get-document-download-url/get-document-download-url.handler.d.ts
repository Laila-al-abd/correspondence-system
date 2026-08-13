import { IQueryHandler } from '@nestjs/cqrs';
import type { DocumentRepository } from '../../../../domain/request/ports/document.repository';
import type { RequestRepository } from '../../../../domain/request/ports/request.repository';
import type { ObjectStorage } from '../../../../domain/shared/object-storage';
import { RequestReadAccessPolicy } from '../../policies/request-read-access.policy';
import { GetDocumentDownloadUrlQuery } from './get-document-download-url.query';
export interface DocumentDownloadUrlView {
    url: string;
    fileName: string;
    expiresInSeconds: number;
    expiresAt: string;
}
export declare class GetDocumentDownloadUrlHandler implements IQueryHandler<GetDocumentDownloadUrlQuery, DocumentDownloadUrlView> {
    private readonly documents;
    private readonly requests;
    private readonly storage;
    private readonly readAccess;
    private readonly logger;
    constructor(documents: DocumentRepository, requests: RequestRepository, storage: ObjectStorage, readAccess: RequestReadAccessPolicy);
    execute(query: GetDocumentDownloadUrlQuery): Promise<DocumentDownloadUrlView>;
}
