import { Prisma, Document as DocumentRow } from '../../../generated/prisma/client';
import { Document } from '../../domain/request/document';
export declare const DocumentMapper: {
    toDomain(row: DocumentRow): Document;
    toPersistence(document: Document): Prisma.DocumentUncheckedCreateInput;
};
