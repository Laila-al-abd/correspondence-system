import { Prisma, Document as DocumentRow } from '../../../generated/prisma/client'
import { Document } from '../../domain/request/document'
import { DocKind } from '../../domain/request/enums'
import { Identifier } from '../../domain/shared/identifier'

/** Maps between the Document entity and the `documents` row. */
export const DocumentMapper = {
  toDomain(row: DocumentRow): Document {
    return Document.rehydrate(Identifier.of(row.id), {
      requestId: Identifier.of(row.requestId),
      requestActionId:
        row.requestActionId != null
          ? Identifier.of(row.requestActionId)
          : undefined,
      uploaderId: Identifier.of(row.uploaderId),
      docKind: row.docKind as DocKind,
      storageKey: row.storageKey,
      fileName: row.fileName,
      mimeType: row.mimeType,
      fileSize: Number(row.fileSize),
      ocrText: row.ocrText ?? undefined,
      uploadedAt: row.uploadedAt,
    })
  },

  toPersistence(document: Document): Prisma.DocumentUncheckedCreateInput {
    const s = document.snapshot()
    return {
      id: BigInt(document.id.toString()),
      requestId: BigInt(s.requestId),
      requestActionId: s.requestActionId ? BigInt(s.requestActionId) : null,
      uploaderId: BigInt(s.uploaderId),
      docKind: s.docKind,
      storageKey: s.storageKey,
      fileName: s.fileName,
      mimeType: s.mimeType,
      fileSize: BigInt(s.fileSize),
      ocrText: s.ocrText ?? null,
      uploadedAt: s.uploadedAt,
    }
  },
}
