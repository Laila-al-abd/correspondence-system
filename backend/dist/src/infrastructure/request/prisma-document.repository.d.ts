import { Document } from '../../domain/request/document';
import { DocumentRepository } from '../../domain/request/ports/document.repository';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaDocumentRepository implements DocumentRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get db();
    findById(id: Identifier): Promise<Document | null>;
    save(document: Document): Promise<void>;
    findExistingStorageKeys(keys: string[]): Promise<Set<string>>;
    listByRequest(requestId: Identifier): Promise<Document[]>;
}
