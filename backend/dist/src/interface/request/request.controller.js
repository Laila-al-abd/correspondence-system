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
exports.RequestController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const current_user_decorator_1 = require("../identity/current-user.decorator");
const submit_request_command_1 = require("../../application/request/commands/submit-request/submit-request.command");
const classify_request_by_model_command_1 = require("../../application/request/commands/classify-request-by-model/classify-request-by-model.command");
const classify_request_by_human_command_1 = require("../../application/request/commands/classify-request-by-human/classify-request-by-human.command");
const flag_for_human_classification_command_1 = require("../../application/request/commands/flag-for-human-classification/flag-for-human-classification.command");
const change_request_priority_command_1 = require("../../application/request/commands/change-request-priority/change-request-priority.command");
const settle_payment_command_1 = require("../../application/request/commands/settle-payment/settle-payment.command");
const record_extraction_command_1 = require("../../application/request/commands/record-extraction/record-extraction.command");
const confirm_request_command_1 = require("../../application/request/commands/confirm-request/confirm-request.command");
const start_request_workflow_command_1 = require("../../application/request/commands/start-request-workflow/start-request-workflow.command");
const assign_step_command_1 = require("../../application/request/commands/assign-step/assign-step.command");
const act_on_step_command_1 = require("../../application/request/commands/act-on-step/act-on-step.command");
const upload_document_command_1 = require("../../application/request/commands/upload-document/upload-document.command");
const get_request_query_1 = require("../../application/request/queries/get-request/get-request.query");
const get_document_download_url_query_1 = require("../../application/request/queries/get-document-download-url/get-document-download-url.query");
const get_request_by_reference_query_1 = require("../../application/request/queries/get-request-by-reference/get-request-by-reference.query");
const list_my_requests_query_1 = require("../../application/request/queries/list-my-requests/list-my-requests.query");
const list_assigned_requests_query_1 = require("../../application/request/queries/list-assigned-requests/list-assigned-requests.query");
const list_request_queue_query_1 = require("../../application/request/queries/list-request-queue/list-request-queue.query");
const list_hitl_queue_query_1 = require("../../application/request/queries/list-hitl-queue/list-hitl-queue.query");
const list_step_candidates_query_1 = require("../../application/request/queries/list-step-candidates/list-step-candidates.query");
const page_query_dto_1 = require("../shared/dto/page-query.dto");
const list_queue_dto_1 = require("./dto/list-queue.dto");
const list_assigned_dto_1 = require("./dto/list-assigned.dto");
const submit_request_dto_1 = require("./dto/submit-request.dto");
const classify_by_model_dto_1 = require("./dto/classify-by-model.dto");
const classify_by_human_dto_1 = require("./dto/classify-by-human.dto");
const change_priority_dto_1 = require("./dto/change-priority.dto");
const waive_payment_dto_1 = require("./dto/waive-payment.dto");
const record_extraction_dto_1 = require("./dto/record-extraction.dto");
const confirm_request_dto_1 = require("./dto/confirm-request.dto");
const assign_step_dto_1 = require("./dto/assign-step.dto");
const act_on_step_dto_1 = require("./dto/act-on-step.dto");
const upload_document_dto_1 = require("./dto/upload-document.dto");
const permissions_decorator_1 = require("../identity/permissions.decorator");
let RequestController = class RequestController {
    commandBus;
    queryBus;
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    listMine(userId, page) {
        return this.queryBus.execute(new list_my_requests_query_1.ListMyRequestsQuery(userId, (0, page_query_dto_1.toNumber)(page.limit), page.cursor));
    }
    listAssigned(userId, dto) {
        return this.queryBus.execute(new list_assigned_requests_query_1.ListAssignedRequestsQuery(userId, (0, page_query_dto_1.toNumber)(dto.limit), dto.cursor, dto.ready === undefined ? undefined : dto.ready === 'true'));
    }
    listHitlQueue(page) {
        return this.queryBus.execute(new list_hitl_queue_query_1.ListHitlQueueQuery((0, page_query_dto_1.toNumber)(page.limit), page.cursor));
    }
    listQueue(dto) {
        return this.queryBus.execute(new list_request_queue_query_1.ListRequestQueueQuery(dto.status, (0, page_query_dto_1.toNumber)(dto.limit), dto.cursor, dto.classificationStatus, dto.hasFilledData === undefined
            ? undefined
            : dto.hasFilledData === 'true', dto.extracted === undefined ? undefined : dto.extracted === 'true'));
    }
    getByReference(referenceNo) {
        return this.queryBus.execute(new get_request_by_reference_query_1.GetRequestByReferenceQuery(referenceNo));
    }
    getOne(userId, id) {
        return this.queryBus.execute(new get_request_query_1.GetRequestQuery(id, userId));
    }
    submit(userId, dto) {
        return this.commandBus.execute(new submit_request_command_1.SubmitRequestCommand({ requesterId: userId, ...dto }));
    }
    classifyByModel(id, dto) {
        return this.commandBus.execute(new classify_request_by_model_command_1.ClassifyRequestByModelCommand({ requestId: id, ...dto }));
    }
    classifyByHuman(id, dto) {
        return this.commandBus.execute(new classify_request_by_human_command_1.ClassifyRequestByHumanCommand({ requestId: id, ...dto }));
    }
    flagForHumanClassification(id) {
        return this.commandBus.execute(new flag_for_human_classification_command_1.FlagForHumanClassificationCommand(id));
    }
    changePriority(actorId, id, dto) {
        return this.commandBus.execute(new change_request_priority_command_1.ChangeRequestPriorityCommand({ requestId: id, actorId, ...dto }));
    }
    recordExtraction(id, dto) {
        return this.commandBus.execute(new record_extraction_command_1.RecordExtractionCommand({ requestId: id, ...dto }));
    }
    confirm(userId, id, dto) {
        return this.commandBus.execute(new confirm_request_command_1.ConfirmRequestCommand({ requestId: id, actorId: userId, ...dto }));
    }
    start(id) {
        return this.commandBus.execute(new start_request_workflow_command_1.StartRequestWorkflowCommand(id));
    }
    confirmPayment(actorId, id, paymentId) {
        return this.commandBus.execute(new settle_payment_command_1.SettlePaymentCommand({
            requestId: id,
            paymentId,
            actorId,
            settlement: settle_payment_command_1.PaymentSettlement.CONFIRM,
        }));
    }
    waivePayment(actorId, id, paymentId, dto) {
        return this.commandBus.execute(new settle_payment_command_1.SettlePaymentCommand({
            requestId: id,
            paymentId,
            actorId,
            settlement: settle_payment_command_1.PaymentSettlement.WAIVE,
            reason: dto.reason,
        }));
    }
    listStepCandidates(id, stepId) {
        return this.queryBus.execute(new list_step_candidates_query_1.ListStepCandidatesQuery(id, stepId));
    }
    assignStep(id, stepId, dto) {
        return this.commandBus.execute(new assign_step_command_1.AssignStepCommand({
            requestId: id,
            stepInstanceId: stepId,
            assigneeUserId: dto.assigneeUserId,
        }));
    }
    actOnStep(userId, id, stepId, dto) {
        return this.commandBus.execute(new act_on_step_command_1.ActOnStepCommand({
            requestId: id,
            stepInstanceId: stepId,
            actorId: userId,
            action: dto.action,
            actionTypeId: dto.actionTypeId,
            comment: dto.comment,
        }));
    }
    getDocumentDownloadUrl(userId, id, documentId) {
        return this.queryBus.execute(new get_document_download_url_query_1.GetDocumentDownloadUrlQuery(id, documentId, userId));
    }
    uploadDocument(userId, id, dto) {
        return this.commandBus.execute(new upload_document_command_1.UploadDocumentCommand({ requestId: id, uploaderId: userId, ...dto }));
    }
};
exports.RequestController = RequestController;
__decorate([
    (0, common_1.Get)('mine'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, page_query_dto_1.PageQueryDto]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "listMine", null);
__decorate([
    (0, common_1.Get)('assigned'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, list_assigned_dto_1.ListAssignedDto]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "listAssigned", null);
__decorate([
    (0, common_1.Get)('queue/hitl'),
    (0, permissions_decorator_1.RequirePermissions)('request.classify'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_query_dto_1.PageQueryDto]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "listHitlQueue", null);
__decorate([
    (0, common_1.Get)('queue'),
    (0, permissions_decorator_1.RequirePermissions)('request.manage'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_queue_dto_1.ListQueueDto]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "listQueue", null);
__decorate([
    (0, common_1.Get)('by-reference/:referenceNo'),
    (0, permissions_decorator_1.RequirePermissions)('request.read'),
    __param(0, (0, common_1.Param)('referenceNo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "getByReference", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, submit_request_dto_1.SubmitRequestDto]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/classify/model'),
    (0, permissions_decorator_1.RequirePermissions)('request.classify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, classify_by_model_dto_1.ClassifyByModelDto]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "classifyByModel", null);
__decorate([
    (0, common_1.Post)(':id/classify/human'),
    (0, permissions_decorator_1.RequirePermissions)('request.classify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, classify_by_human_dto_1.ClassifyByHumanDto]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "classifyByHuman", null);
__decorate([
    (0, common_1.Post)(':id/classify/needs-review'),
    (0, permissions_decorator_1.RequirePermissions)('request.classify'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "flagForHumanClassification", null);
__decorate([
    (0, common_1.Patch)(':id/priority'),
    (0, permissions_decorator_1.RequirePermissions)('request.act'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, change_priority_dto_1.ChangePriorityDto]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "changePriority", null);
__decorate([
    (0, common_1.Patch)(':id/filled-data'),
    (0, permissions_decorator_1.RequirePermissions)('request.classify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, record_extraction_dto_1.RecordExtractionDto]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "recordExtraction", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, confirm_request_dto_1.ConfirmRequestDto]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "confirm", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, permissions_decorator_1.RequirePermissions)('request.act'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "start", null);
__decorate([
    (0, common_1.Post)(':id/payments/:paymentId/confirm'),
    (0, permissions_decorator_1.RequirePermissions)('payment.settle'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "confirmPayment", null);
__decorate([
    (0, common_1.Post)(':id/payments/:paymentId/waive'),
    (0, permissions_decorator_1.RequirePermissions)('payment.settle'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('paymentId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, waive_payment_dto_1.WaivePaymentDto]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "waivePayment", null);
__decorate([
    (0, common_1.Get)(':id/steps/:stepId/candidates'),
    (0, permissions_decorator_1.RequirePermissions)('workflow.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('stepId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "listStepCandidates", null);
__decorate([
    (0, common_1.Post)(':id/steps/:stepId/assign'),
    (0, permissions_decorator_1.RequirePermissions)('workflow.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('stepId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, assign_step_dto_1.AssignStepDto]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "assignStep", null);
__decorate([
    (0, common_1.Post)(':id/steps/:stepId/actions'),
    (0, permissions_decorator_1.RequirePermissions)('request.act'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('stepId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, act_on_step_dto_1.ActOnStepDto]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "actOnStep", null);
__decorate([
    (0, common_1.Get)(':id/documents/:documentId/download-url'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('documentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "getDocumentDownloadUrl", null);
__decorate([
    (0, common_1.Post)(':id/documents'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, upload_document_dto_1.UploadDocumentDto]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "uploadDocument", null);
exports.RequestController = RequestController = __decorate([
    (0, common_1.Controller)('requests'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], RequestController);
//# sourceMappingURL=request.controller.js.map