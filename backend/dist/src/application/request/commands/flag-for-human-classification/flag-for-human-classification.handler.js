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
exports.FlagForHumanClassificationHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const notification_emitter_1 = require("../../../observability/services/notification-emitter");
const event_recorder_1 = require("../../../observability/services/event-recorder");
const request_stage_1 = require("../../queries/views/request-stage");
const flag_for_human_classification_command_1 = require("./flag-for-human-classification.command");
let FlagForHumanClassificationHandler = class FlagForHumanClassificationHandler {
    requests;
    notifier;
    events;
    constructor(requests, notifier, events) {
        this.requests = requests;
        this.notifier = notifier;
        this.events = events;
    }
    async execute({ requestId, }) {
        const request = await this.requests.findById(identifier_1.Identifier.of(requestId));
        if (!request)
            throw new errors_1.EntityNotFoundError('Request', requestId);
        if (request.classificationStatus === 'HITL')
            return {
                id: request.id.toString(),
                classificationStatus: request.classificationStatus,
            };
        const stageBefore = (0, request_stage_1.stageOfRequest)(request);
        request.flagForHumanClassification();
        await this.requests.save(request);
        await this.events.statusChanged({
            requestId: request.id.toString(),
            from: stageBefore,
            to: (0, request_stage_1.stageOfRequest)(request),
        });
        await this.notifier.classificationNeedsReview({
            requestId: request.id.toString(),
            referenceNo: request.referenceNo,
        });
        return {
            id: request.id.toString(),
            classificationStatus: request.classificationStatus,
        };
    }
};
exports.FlagForHumanClassificationHandler = FlagForHumanClassificationHandler;
exports.FlagForHumanClassificationHandler = FlagForHumanClassificationHandler = __decorate([
    (0, cqrs_1.CommandHandler)(flag_for_human_classification_command_1.FlagForHumanClassificationCommand),
    __param(0, (0, common_1.Inject)(tokens_1.REQUEST_REPOSITORY)),
    __metadata("design:paramtypes", [Object, notification_emitter_1.NotificationEmitter,
        event_recorder_1.EventRecorder])
], FlagForHumanClassificationHandler);
//# sourceMappingURL=flag-for-human-classification.handler.js.map