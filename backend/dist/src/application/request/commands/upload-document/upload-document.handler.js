"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadDocumentHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const document_1 = require("../../../../domain/request/document");
const enums_1 = require("../../../../domain/request/enums");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const document_rules_1 = require("../../document-rules");
const upload_document_command_1 = require("./upload-document.command");
let UploadDocumentHandler = class UploadDocumentHandler {
    requests;
    documents;
    storage;
    ids;
    constructor(requests, documents, storage, ids) {
        this.requests = requests;
        this.documents = documents;
        this.storage = storage;
        this.ids = ids;
    }
    async execute({ input, }) {
        const requestId = identifier_1.Identifier.of(input.requestId);
        const request = await this.requests.findById(requestId);
        if (!request)
            throw new errors_1.EntityNotFoundError('Request', input.requestId);
        const body = Buffer.from(input.contentBase64, 'base64');
        (0, document_rules_1.assertUploadIsAcceptable)(input.mimeType, body);
        const id = this.ids.next();
        const storageKey = `requests/${input.requestId}/${id.toString()}/${input.fileName}`;
        await this.storage.save({
            key: storageKey,
            body,
            contentType: input.mimeType,
            size: body.length,
        });
        const document = document_1.Document.create(id, {
            requestId,
            uploaderId: identifier_1.Identifier.of(input.uploaderId),
            docKind: input.docKind ? input.docKind : enums_1.DocKind.UPLOADED,
            storageKey,
            fileName: input.fileName,
            mimeType: input.mimeType,
            fileSize: body.length,
            requestActionId: input.requestActionId
                ? identifier_1.Identifier.of(input.requestActionId)
                : undefined,
            ocrText: input.ocrText,
        });
        await this.documents.save(document);
        return { id: id.toString(), storageKey };
    }
};
exports.UploadDocumentHandler = UploadDocumentHandler;
exports.UploadDocumentHandler = UploadDocumentHandler = __decorate([
    (0, cqrs_1.CommandHandler)(upload_document_command_1.UploadDocumentCommand),
    __param(0, (0, common_1.Inject)(tokens_1.REQUEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.DOCUMENT_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.OBJECT_STORAGE)),
    __param(3, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], UploadDocumentHandler);
//# sourceMappingURL=upload-document.handler.js.map