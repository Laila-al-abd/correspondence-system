"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentMapper = void 0;
const document_1 = require("../../domain/request/document");
const identifier_1 = require("../../domain/shared/identifier");
exports.DocumentMapper = {
    toDomain(row) {
        return document_1.Document.rehydrate(identifier_1.Identifier.of(row.id), {
            requestId: identifier_1.Identifier.of(row.requestId),
            requestActionId: row.requestActionId != null
                ? identifier_1.Identifier.of(row.requestActionId)
                : undefined,
            uploaderId: identifier_1.Identifier.of(row.uploaderId),
            docKind: row.docKind,
            storageKey: row.storageKey,
            fileName: row.fileName,
            mimeType: row.mimeType,
            fileSize: Number(row.fileSize),
            ocrText: row.ocrText ?? undefined,
            uploadedAt: row.uploadedAt,
        });
    },
    toPersistence(document) {
        const s = document.snapshot();
        return {
            id: document.id.toString(),
            requestId: s.requestId,
            requestActionId: s.requestActionId ? s.requestActionId : null,
            uploaderId: s.uploaderId,
            docKind: s.docKind,
            storageKey: s.storageKey,
            fileName: s.fileName,
            mimeType: s.mimeType,
            fileSize: BigInt(s.fileSize),
            ocrText: s.ocrText ?? null,
            uploadedAt: s.uploadedAt,
        };
    },
};
//# sourceMappingURL=document.mapper.js.map