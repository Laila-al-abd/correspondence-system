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
exports.GetRequestByReferenceHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const get_request_by_reference_query_1 = require("./get-request-by-reference.query");
const request_view_1 = require("../views/request.view");
let GetRequestByReferenceHandler = class GetRequestByReferenceHandler {
    requests;
    actions;
    documents;
    payments;
    templates;
    constructor(requests, actions, documents, payments, templates) {
        this.requests = requests;
        this.actions = actions;
        this.documents = documents;
        this.payments = payments;
        this.templates = templates;
    }
    async execute(query) {
        const request = await this.requests.findByReferenceNo(query.referenceNo);
        if (!request)
            throw new errors_1.EntityNotFoundError('Request', query.referenceNo);
        const id = request.id;
        const templateId = request.snapshot().templateId;
        const [actions, documents, payments, template] = await Promise.all([
            this.actions.listByRequest(id),
            this.documents.listByRequest(id),
            this.payments.listByRequest(id),
            templateId
                ? this.templates.findById(identifier_1.Identifier.of(templateId))
                : Promise.resolve(null),
        ]);
        const openStepInstances = request.snapshot().stepInstances.filter((si) => ['PENDING', 'IN_PROGRESS', 'WAITING'].includes(si.status) &&
            !si.slaPaused &&
            si.slaDueAt != null);
        const computedSlaDueAt = openStepInstances.length > 0
            ? new Date(Math.min(...openStepInstances.map((si) => si.slaDueAt.getTime())))
            : undefined;
        const detail = (0, request_view_1.toRequestDetail)(request, actions, documents, payments, undefined, template ?? undefined);
        return { ...detail, slaDueAt: computedSlaDueAt?.toISOString() };
    }
};
exports.GetRequestByReferenceHandler = GetRequestByReferenceHandler;
exports.GetRequestByReferenceHandler = GetRequestByReferenceHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_request_by_reference_query_1.GetRequestByReferenceQuery),
    __param(0, (0, common_1.Inject)(tokens_1.REQUEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.REQUEST_ACTION_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.DOCUMENT_REPOSITORY)),
    __param(3, (0, common_1.Inject)(tokens_1.PAYMENT_REPOSITORY)),
    __param(4, (0, common_1.Inject)(tokens_1.TEMPLATE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], GetRequestByReferenceHandler);
//# sourceMappingURL=get-request-by-reference.handler.js.map