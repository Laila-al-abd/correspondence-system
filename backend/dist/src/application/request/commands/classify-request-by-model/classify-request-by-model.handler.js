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
exports.ClassifyRequestByModelHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const enums_1 = require("../../../../domain/request/enums");
const identifier_1 = require("../../../../domain/shared/identifier");
const ml_prediction_1 = require("../../../../domain/observability/ml-prediction");
const enums_2 = require("../../../../domain/observability/enums");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const notification_emitter_1 = require("../../../observability/services/notification-emitter");
const template_submission_policy_1 = require("../../services/template-submission-policy");
const event_recorder_1 = require("../../../observability/services/event-recorder");
const request_stage_1 = require("../../queries/views/request-stage");
const classify_request_by_model_command_1 = require("./classify-request-by-model.command");
const UNSPECIFIED_MODEL_VERSION = 'unspecified';
let ClassifyRequestByModelHandler = class ClassifyRequestByModelHandler {
    requests;
    templates;
    notifier;
    submissionPolicy;
    predictions;
    ids;
    transaction;
    events;
    constructor(requests, templates, notifier, submissionPolicy, predictions, ids, transaction, events) {
        this.requests = requests;
        this.templates = templates;
        this.notifier = notifier;
        this.submissionPolicy = submissionPolicy;
        this.predictions = predictions;
        this.ids = ids;
        this.transaction = transaction;
        this.events = events;
    }
    async execute({ input, }) {
        const request = await this.requests.findById(identifier_1.Identifier.of(input.requestId));
        if (!request)
            throw new errors_1.EntityNotFoundError('Request', input.requestId);
        const template = await this.templates.findById(identifier_1.Identifier.of(input.templateId));
        if (!template)
            throw new errors_1.EntityNotFoundError('Template', input.templateId);
        await this.submissionPolicy.assertMayBeClassifiedAs(request, template);
        const stageBefore = (0, request_stage_1.stageOfRequest)(request);
        request.classifyByModel(identifier_1.Identifier.of(input.templateId), input.confidence, input.threshold, template.defaultPriority);
        await this.transaction.run(async () => {
            await this.requests.save(request);
            await this.predictions.save(ml_prediction_1.MlPrediction.create(this.ids.next(), {
                requestId: request.id,
                modelType: enums_2.ModelType.NLP_CLASSIFIER,
                modelVersion: input.modelVersion ?? UNSPECIFIED_MODEL_VERSION,
                predictedValue: { templateId: input.templateId },
                confidence: input.confidence,
            }));
            await this.events.statusChanged({
                requestId: request.id.toString(),
                from: stageBefore,
                to: (0, request_stage_1.stageOfRequest)(request),
            });
        });
        if (request.classificationStatus === enums_1.ClassificationStatus.HITL) {
            await this.notifier.classificationNeedsReview({
                requestId: request.id.toString(),
                referenceNo: request.referenceNo,
            });
        }
        else {
            await this.notifier.confirmationRequired({
                requesterId: request.requesterId.toString(),
                requestId: request.id.toString(),
                referenceNo: request.referenceNo,
            });
        }
        return {
            id: request.id.toString(),
            classificationStatus: request.classificationStatus,
        };
    }
};
exports.ClassifyRequestByModelHandler = ClassifyRequestByModelHandler;
exports.ClassifyRequestByModelHandler = ClassifyRequestByModelHandler = __decorate([
    (0, cqrs_1.CommandHandler)(classify_request_by_model_command_1.ClassifyRequestByModelCommand),
    __param(0, (0, common_1.Inject)(tokens_1.REQUEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.TEMPLATE_REPOSITORY)),
    __param(4, (0, common_1.Inject)(tokens_1.ML_PREDICTION_REPOSITORY)),
    __param(5, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __param(6, (0, common_1.Inject)(tokens_1.TRANSACTION_RUNNER)),
    __metadata("design:paramtypes", [Object, Object, notification_emitter_1.NotificationEmitter,
        template_submission_policy_1.TemplateSubmissionPolicy, Object, Object, Object, event_recorder_1.EventRecorder])
], ClassifyRequestByModelHandler);
//# sourceMappingURL=classify-request-by-model.handler.js.map