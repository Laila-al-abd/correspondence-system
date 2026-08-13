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
exports.ClassifyRequestByHumanHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const template_submission_policy_1 = require("../../services/template-submission-policy");
const notification_emitter_1 = require("../../../observability/services/notification-emitter");
const event_recorder_1 = require("../../../observability/services/event-recorder");
const request_stage_1 = require("../../queries/views/request-stage");
const classify_request_by_human_command_1 = require("./classify-request-by-human.command");
let ClassifyRequestByHumanHandler = class ClassifyRequestByHumanHandler {
    requests;
    templates;
    submissionPolicy;
    notifier;
    events;
    constructor(requests, templates, submissionPolicy, notifier, events) {
        this.requests = requests;
        this.templates = templates;
        this.submissionPolicy = submissionPolicy;
        this.notifier = notifier;
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
        request.classifyByHuman(identifier_1.Identifier.of(input.templateId), template.defaultPriority);
        let fieldsWritten = 0;
        if (input.filledData) {
            const violations = template.validatePartial(input.filledData);
            if (violations.length > 0)
                throw new errors_1.FilledDataInvalidError(violations);
            request.setFilledData(input.filledData);
            fieldsWritten = Object.keys(input.filledData).length;
        }
        request.markExtractionAttempted();
        await this.requests.save(request);
        await this.events.statusChanged({
            requestId: request.id.toString(),
            from: stageBefore,
            to: (0, request_stage_1.stageOfRequest)(request),
        });
        await this.notifier.confirmationRequired({
            requesterId: request.requesterId.toString(),
            requestId: request.id.toString(),
            referenceNo: request.referenceNo,
        });
        return {
            id: request.id.toString(),
            classificationStatus: request.classificationStatus,
            fieldsWritten,
        };
    }
};
exports.ClassifyRequestByHumanHandler = ClassifyRequestByHumanHandler;
exports.ClassifyRequestByHumanHandler = ClassifyRequestByHumanHandler = __decorate([
    (0, cqrs_1.CommandHandler)(classify_request_by_human_command_1.ClassifyRequestByHumanCommand),
    __param(0, (0, common_1.Inject)(tokens_1.REQUEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.TEMPLATE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, template_submission_policy_1.TemplateSubmissionPolicy,
        notification_emitter_1.NotificationEmitter,
        event_recorder_1.EventRecorder])
], ClassifyRequestByHumanHandler);
//# sourceMappingURL=classify-request-by-human.handler.js.map