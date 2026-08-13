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
exports.GetRequestHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const request_read_access_policy_1 = require("../../policies/request-read-access.policy");
const get_request_query_1 = require("./get-request.query");
const request_view_1 = require("../views/request.view");
let GetRequestHandler = class GetRequestHandler {
    requests;
    actions;
    documents;
    payments;
    requestQuery;
    templates;
    workflowPaths;
    readAccess;
    constructor(requests, actions, documents, payments, requestQuery, templates, workflowPaths, readAccess) {
        this.requests = requests;
        this.actions = actions;
        this.documents = documents;
        this.payments = payments;
        this.requestQuery = requestQuery;
        this.templates = templates;
        this.workflowPaths = workflowPaths;
        this.readAccess = readAccess;
    }
    async execute(query) {
        const id = identifier_1.Identifier.of(query.requestId);
        const request = await this.requests.findById(id);
        if (!request)
            throw new errors_1.EntityNotFoundError('Request', query.requestId);
        await this.readAccess.assertMayRead(query.requestedBy, request.requesterId.toString());
        const templateId = request.snapshot().templateId;
        const workflowPathId = request.snapshot().workflowPathId;
        const [actions, documents, payments, durationEstimate, template, workflowPath] = await Promise.all([
            this.actions.listByRequest(id),
            this.documents.listByRequest(id),
            this.payments.listByRequest(id),
            templateId
                ? this.requestQuery.estimateDuration(templateId)
                : Promise.resolve(undefined),
            templateId
                ? this.templates.findById(identifier_1.Identifier.of(templateId))
                : Promise.resolve(null),
            workflowPathId
                ? this.workflowPaths.findById(identifier_1.Identifier.of(workflowPathId))
                : Promise.resolve(null),
        ]);
        const openStepInstances = request.snapshot().stepInstances.filter((si) => ['PENDING', 'IN_PROGRESS', 'WAITING'].includes(si.status) &&
            !si.slaPaused &&
            si.slaDueAt != null);
        const computedSlaDueAt = openStepInstances.length > 0
            ? new Date(Math.min(...openStepInstances.map((si) => si.slaDueAt.getTime())))
            : undefined;
        const detail = (0, request_view_1.toRequestDetail)(request, actions, documents, payments, durationEstimate, template ?? undefined, workflowPath?.steps ? [...workflowPath.steps] : undefined);
        return { ...detail, slaDueAt: computedSlaDueAt?.toISOString() };
    }
};
exports.GetRequestHandler = GetRequestHandler;
exports.GetRequestHandler = GetRequestHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_request_query_1.GetRequestQuery),
    __param(0, (0, common_1.Inject)(tokens_1.REQUEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.REQUEST_ACTION_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.DOCUMENT_REPOSITORY)),
    __param(3, (0, common_1.Inject)(tokens_1.PAYMENT_REPOSITORY)),
    __param(4, (0, common_1.Inject)(tokens_1.REQUEST_QUERY)),
    __param(5, (0, common_1.Inject)(tokens_1.TEMPLATE_REPOSITORY)),
    __param(6, (0, common_1.Inject)(tokens_1.WORKFLOW_PATH_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, request_read_access_policy_1.RequestReadAccessPolicy])
], GetRequestHandler);
//# sourceMappingURL=get-request.handler.js.map