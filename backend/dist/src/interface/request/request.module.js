"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const access_module_1 = require("../access/access.module");
const catalog_module_1 = require("../catalog/catalog.module");
const observability_module_1 = require("../observability/observability.module");
const tokens_1 = require("../../application/tokens");
const prisma_request_repository_1 = require("../../infrastructure/request/prisma-request.repository");
const prisma_request_query_1 = require("../../infrastructure/request/prisma-request-query");
const prisma_request_action_repository_1 = require("../../infrastructure/request/prisma-request-action.repository");
const prisma_payment_repository_1 = require("../../infrastructure/request/prisma-payment.repository");
const prisma_document_repository_1 = require("../../infrastructure/request/prisma-document.repository");
const prisma_role_repository_1 = require("../../infrastructure/identity/prisma-role.repository");
const prisma_workflow_path_repository_1 = require("../../infrastructure/workflow/prisma-workflow-path.repository");
const minio_object_storage_1 = require("../../infrastructure/storage/minio-object-storage");
const uuid_v7_id_generator_1 = require("../../infrastructure/shared/uuid-v7-id.generator");
const prisma_reference_number_generator_1 = require("../../infrastructure/shared/prisma-reference-number.generator");
const submit_request_handler_1 = require("../../application/request/commands/submit-request/submit-request.handler");
const classify_request_by_model_handler_1 = require("../../application/request/commands/classify-request-by-model/classify-request-by-model.handler");
const classify_request_by_human_handler_1 = require("../../application/request/commands/classify-request-by-human/classify-request-by-human.handler");
const flag_for_human_classification_handler_1 = require("../../application/request/commands/flag-for-human-classification/flag-for-human-classification.handler");
const change_request_priority_handler_1 = require("../../application/request/commands/change-request-priority/change-request-priority.handler");
const settle_payment_handler_1 = require("../../application/request/commands/settle-payment/settle-payment.handler");
const record_extraction_handler_1 = require("../../application/request/commands/record-extraction/record-extraction.handler");
const confirm_request_handler_1 = require("../../application/request/commands/confirm-request/confirm-request.handler");
const start_request_workflow_handler_1 = require("../../application/request/commands/start-request-workflow/start-request-workflow.handler");
const assign_step_handler_1 = require("../../application/request/commands/assign-step/assign-step.handler");
const act_on_step_handler_1 = require("../../application/request/commands/act-on-step/act-on-step.handler");
const upload_document_handler_1 = require("../../application/request/commands/upload-document/upload-document.handler");
const get_request_handler_1 = require("../../application/request/queries/get-request/get-request.handler");
const get_request_by_reference_handler_1 = require("../../application/request/queries/get-request-by-reference/get-request-by-reference.handler");
const list_my_requests_handler_1 = require("../../application/request/queries/list-my-requests/list-my-requests.handler");
const list_assigned_requests_handler_1 = require("../../application/request/queries/list-assigned-requests/list-assigned-requests.handler");
const list_request_queue_handler_1 = require("../../application/request/queries/list-request-queue/list-request-queue.handler");
const list_hitl_queue_handler_1 = require("../../application/request/queries/list-hitl-queue/list-hitl-queue.handler");
const list_step_candidates_handler_1 = require("../../application/request/queries/list-step-candidates/list-step-candidates.handler");
const get_document_download_url_handler_1 = require("../../application/request/queries/get-document-download-url/get-document-download-url.handler");
const request_controller_1 = require("./request.controller");
const assignee_resolver_1 = require("../../application/request/services/assignee-resolver");
const template_submission_policy_1 = require("../../application/request/services/template-submission-policy");
const request_read_access_policy_1 = require("../../application/request/policies/request-read-access.policy");
const prisma_assignee_directory_1 = require("../../infrastructure/request/prisma-assignee-directory");
const sla_monitor_service_1 = require("../../application/observability/services/sla-monitor.service");
const sla_monitor_scheduler_1 = require("../../infrastructure/observability/sla-monitor.scheduler");
const prisma_sla_scan_1 = require("../../infrastructure/observability/prisma-sla-scan");
const handlers = [
    submit_request_handler_1.SubmitRequestHandler,
    classify_request_by_model_handler_1.ClassifyRequestByModelHandler,
    classify_request_by_human_handler_1.ClassifyRequestByHumanHandler,
    flag_for_human_classification_handler_1.FlagForHumanClassificationHandler,
    change_request_priority_handler_1.ChangeRequestPriorityHandler,
    record_extraction_handler_1.RecordExtractionHandler,
    confirm_request_handler_1.ConfirmRequestHandler,
    start_request_workflow_handler_1.StartRequestWorkflowHandler,
    assign_step_handler_1.AssignStepHandler,
    act_on_step_handler_1.ActOnStepHandler,
    settle_payment_handler_1.SettlePaymentHandler,
    upload_document_handler_1.UploadDocumentHandler,
    get_request_handler_1.GetRequestHandler,
    get_request_by_reference_handler_1.GetRequestByReferenceHandler,
    list_my_requests_handler_1.ListMyRequestsHandler,
    list_assigned_requests_handler_1.ListAssignedRequestsHandler,
    list_request_queue_handler_1.ListRequestQueueHandler,
    list_hitl_queue_handler_1.ListHitlQueueHandler,
    list_step_candidates_handler_1.ListStepCandidatesHandler,
    get_document_download_url_handler_1.GetDocumentDownloadUrlHandler,
];
let RequestModule = class RequestModule {
};
exports.RequestModule = RequestModule;
exports.RequestModule = RequestModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule, access_module_1.AccessModule, catalog_module_1.CatalogModule, observability_module_1.ObservabilityModule],
        controllers: [request_controller_1.RequestController],
        providers: [
            ...handlers,
            { provide: tokens_1.REQUEST_REPOSITORY, useClass: prisma_request_repository_1.PrismaRequestRepository },
            { provide: tokens_1.REQUEST_QUERY, useClass: prisma_request_query_1.PrismaRequestQuery },
            {
                provide: tokens_1.REQUEST_ACTION_REPOSITORY,
                useClass: prisma_request_action_repository_1.PrismaRequestActionRepository,
            },
            { provide: tokens_1.PAYMENT_REPOSITORY, useClass: prisma_payment_repository_1.PrismaPaymentRepository },
            { provide: tokens_1.DOCUMENT_REPOSITORY, useClass: prisma_document_repository_1.PrismaDocumentRepository },
            {
                provide: tokens_1.WORKFLOW_PATH_REPOSITORY,
                useClass: prisma_workflow_path_repository_1.PrismaWorkflowPathRepository,
            },
            { provide: tokens_1.ID_GENERATOR, useClass: uuid_v7_id_generator_1.UuidV7IdGenerator },
            {
                provide: tokens_1.REFERENCE_NUMBER_GENERATOR,
                useClass: prisma_reference_number_generator_1.PrismaReferenceNumberGenerator,
            },
            { provide: tokens_1.OBJECT_STORAGE, useClass: minio_object_storage_1.MinioObjectStorage },
            { provide: tokens_1.ASSIGNEE_DIRECTORY, useClass: prisma_assignee_directory_1.PrismaAssigneeDirectory },
            { provide: tokens_1.ROLE_REPOSITORY, useClass: prisma_role_repository_1.PrismaRoleRepository },
            { provide: tokens_1.SLA_SCAN, useClass: prisma_sla_scan_1.PrismaSlaScan },
            assignee_resolver_1.AssigneeResolver,
            template_submission_policy_1.TemplateSubmissionPolicy,
            request_read_access_policy_1.RequestReadAccessPolicy,
            sla_monitor_service_1.SlaMonitorService,
            sla_monitor_scheduler_1.SlaMonitorScheduler,
        ],
        exports: [
            tokens_1.REQUEST_REPOSITORY,
            tokens_1.REQUEST_ACTION_REPOSITORY,
            tokens_1.PAYMENT_REPOSITORY,
            tokens_1.DOCUMENT_REPOSITORY,
            tokens_1.OBJECT_STORAGE,
        ],
    })
], RequestModule);
//# sourceMappingURL=request.module.js.map