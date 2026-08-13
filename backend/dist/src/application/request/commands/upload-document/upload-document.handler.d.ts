import { ICommandHandler } from '@nestjs/cqrs';
import type { RequestRepository } from '../../../../domain/request/ports/request.repository';
import type { DocumentRepository } from '../../../../domain/request/ports/document.repository';
import type { ObjectStorage } from '../../../../domain/shared/object-storage';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import { UploadDocumentCommand } from './upload-document.command';
export interface UploadDocumentResult {
    id: string;
    storageKey: string;
}
export declare class UploadDocumentHandler implements ICommandHandler<UploadDocumentCommand, UploadDocumentResult> {
    private readonly requests;
    private readonly documents;
    private readonly storage;
    private readonly ids;
    constructor(requests: RequestRepository, documents: DocumentRepository, storage: ObjectStorage, ids: IdGenerator);
    execute({ input, }: UploadDocumentCommand): Promise<UploadDocumentResult>;
}
