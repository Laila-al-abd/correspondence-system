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
var ConfirmRequestHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmRequestHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const notification_emitter_1 = require("../../../observability/services/notification-emitter");
const errors_1 = require("../../../errors");
const tokens_1 = require("../../../tokens");
const event_recorder_1 = require("../../../observability/services/event-recorder");
const request_stage_1 = require("../../queries/views/request-stage");
const start_request_workflow_command_1 = require("../start-request-workflow/start-request-workflow.command");
const confirm_request_command_1 = require("./confirm-request.command");
let ConfirmRequestHandler = ConfirmRequestHandler_1 = class ConfirmRequestHandler {
    requests;
    templates;
    notifier;
    events;
    commandBus;
    logger = new common_1.Logger(ConfirmRequestHandler_1.name);
    constructor(requests, templates, notifier, events, commandBus) {
        this.requests = requests;
        this.templates = templates;
        this.notifier = notifier;
        this.events = events;
        this.commandBus = commandBus;
    }
    async execute({ input }) {
        const request = await this.requests.findById(identifier_1.Identifier.of(input.requestId));
        if (!request)
            throw new errors_1.EntityNotFoundError('Request', input.requestId);
        if (request.requesterId.toString() !== input.actorId)
            throw new errors_1.ForbiddenActionError('Only the person who submitted a request can confirm what was extracted from it.');
        const stageBefore = (0, request_stage_1.stageOfRequest)(request);
        if (input.outcome === 'CONFIRM') {
            if (input.filledData)
                request.applyRequesterValues(input.filledData);
            const templateId = request.templateId;
            if (!templateId)
                throw new errors_1.ForbiddenActionError('There is nothing to confirm until the request has been classified.');
            const template = await this.templates.findById(templateId);
            if (!template)
                throw new errors_1.EntityNotFoundError('Template', templateId.toString());
            const violations = template.validateFilledData(request.filledData ?? {});
            if (violations.length > 0)
                throw new errors_1.FilledDataInvalidError(violations);
            request.confirm();
            await this.requests.save(request);
            await this.events.statusChanged({
                requestId: request.id.toString(),
                from: stageBefore,
                to: (0, request_stage_1.stageOfRequest)(request),
                actorId: input.actorId,
            });
            try {
                await this.commandBus.execute(new start_request_workflow_command_1.StartRequestWorkflowCommand(request.id.toString()));
            }
            catch (error) {
                this.logger.warn(`Auto-start after confirmation failed for request ${request.id.toString()}: ` +
                    `${error instanceof Error ? error.message : String(error)}`);
            }
        }
        else {
            request.dispute();
            await this.requests.save(request);
            await this.events.statusChanged({
                requestId: request.id.toString(),
                from: stageBefore,
                to: (0, request_stage_1.stageOfRequest)(request),
                actorId: input.actorId,
            });
            await this.notifier.classificationNeedsReview({
                requestId: request.id.toString(),
                referenceNo: request.referenceNo,
            });
        }
        return {
            id: request.id.toString(),
            outcome: input.outcome,
            classificationStatus: request.classificationStatus,
            confirmedAt: request.confirmedAt?.toISOString(),
        };
    }
};
exports.ConfirmRequestHandler = ConfirmRequestHandler;
exports.ConfirmRequestHandler = ConfirmRequestHandler = ConfirmRequestHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(confirm_request_command_1.ConfirmRequestCommand),
    __param(0, (0, common_1.Inject)(tokens_1.REQUEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.TEMPLATE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, notification_emitter_1.NotificationEmitter,
        event_recorder_1.EventRecorder,
        cqrs_1.CommandBus])
], ConfirmRequestHandler);
//# sourceMappingURL=confirm-request.handler.js.map