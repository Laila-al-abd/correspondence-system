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
var GetDocumentDownloadUrlHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDocumentDownloadUrlHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const request_read_access_policy_1 = require("../../policies/request-read-access.policy");
const get_document_download_url_query_1 = require("./get-document-download-url.query");
const LINK_TTL_SECONDS = 60;
let GetDocumentDownloadUrlHandler = GetDocumentDownloadUrlHandler_1 = class GetDocumentDownloadUrlHandler {
    documents;
    requests;
    storage;
    readAccess;
    logger = new common_1.Logger(GetDocumentDownloadUrlHandler_1.name);
    constructor(documents, requests, storage, readAccess) {
        this.documents = documents;
        this.requests = requests;
        this.storage = storage;
        this.readAccess = readAccess;
    }
    async execute(query) {
        const document = await this.documents.findById(identifier_1.Identifier.of(query.documentId));
        if (!document)
            throw new errors_1.EntityNotFoundError('Document', query.documentId);
        if (document.requestId.toString() !== query.requestId)
            throw new errors_1.EntityNotFoundError('Document', query.documentId);
        const request = await this.requests.findById(identifier_1.Identifier.of(query.requestId));
        if (!request)
            throw new errors_1.EntityNotFoundError('Request', query.requestId);
        await this.readAccess.assertMayRead(query.requestedBy, request.requesterId.toString());
        const url = await this.storage.getPresignedUrl(document.storageKey, LINK_TTL_SECONDS);
        const expiresAt = new Date(Date.now() + LINK_TTL_SECONDS * 1000);
        this.logger.log([
            'document link issued',
            `userId=${query.requestedBy}`,
            `requestId=${query.requestId}`,
            `documentId=${query.documentId}`,
            `ttlSeconds=${LINK_TTL_SECONDS}`,
            `at=${new Date().toISOString()}`,
        ].join(' '));
        return {
            url,
            fileName: document.fileName,
            expiresInSeconds: LINK_TTL_SECONDS,
            expiresAt: expiresAt.toISOString(),
        };
    }
};
exports.GetDocumentDownloadUrlHandler = GetDocumentDownloadUrlHandler;
exports.GetDocumentDownloadUrlHandler = GetDocumentDownloadUrlHandler = GetDocumentDownloadUrlHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_document_download_url_query_1.GetDocumentDownloadUrlQuery),
    __param(0, (0, common_1.Inject)(tokens_1.DOCUMENT_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.REQUEST_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.OBJECT_STORAGE)),
    __metadata("design:paramtypes", [Object, Object, Object, request_read_access_policy_1.RequestReadAccessPolicy])
], GetDocumentDownloadUrlHandler);
//# sourceMappingURL=get-document-download-url.handler.js.map