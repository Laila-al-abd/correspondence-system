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
exports.RecordExtractionHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const enums_1 = require("../../../../domain/request/enums");
const identifier_1 = require("../../../../domain/shared/identifier");
const ml_prediction_1 = require("../../../../domain/observability/ml-prediction");
const enums_2 = require("../../../../domain/observability/enums");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const notification_emitter_1 = require("../../../observability/services/notification-emitter");
const record_extraction_command_1 = require("./record-extraction.command");
const UNKNOWN_FIELD_REASON = 'This field is not part of this template.';
let RecordExtractionHandler = class RecordExtractionHandler {
    requests;
    templates;
    predictions;
    ids;
    transaction;
    notifier;
    constructor(requests, templates, predictions, ids, transaction, notifier) {
        this.requests = requests;
        this.templates = templates;
        this.predictions = predictions;
        this.ids = ids;
        this.transaction = transaction;
        this.notifier = notifier;
    }
    async execute({ input, }) {
        const request = await this.requests.findById(identifier_1.Identifier.of(input.requestId));
        if (!request)
            throw new errors_1.EntityNotFoundError('Request', input.requestId);
        if (request.classificationStatus === enums_1.ClassificationStatus.HITL)
            throw new errors_1.RequestNotExtractableError(input.requestId, 'it is in the human review queue, where a reviewer fills the fields');
        if (request.classificationStatus !== enums_1.ClassificationStatus.CLASSIFIED)
            throw new errors_1.RequestNotExtractableError(input.requestId, 'it has not been classified yet');
        const templateId = request.templateId;
        if (!templateId)
            throw new errors_1.RequestNotExtractableError(input.requestId, 'it is classified but carries no template');
        const template = await this.templates.findById(templateId);
        if (!template)
            throw new errors_1.EntityNotFoundError('Template', templateId.toString());
        const abstained = input.abstained ?? [];
        const unknown = new Set(template.unknownKeys([...Object.keys(input.filledData), ...abstained]));
        const rejected = [];
        const accepted = {};
        for (const [fieldKey, value] of Object.entries(input.filledData)) {
            if (unknown.has(fieldKey)) {
                rejected.push({ fieldKey, reason: UNKNOWN_FIELD_REASON });
                continue;
            }
            const reason = template.validatePartial({ [fieldKey]: value })[0]?.reason;
            if (reason === undefined)
                accepted[fieldKey] = value;
            else
                rejected.push({ fieldKey, reason });
        }
        const knownAbstained = abstained.filter((fieldKey) => {
            if (!unknown.has(fieldKey))
                return true;
            rejected.push({ fieldKey, reason: UNKNOWN_FIELD_REASON });
            return false;
        });
        request.applyExtractedFields(accepted);
        request.markExtractionAttempted();
        const meta = input.extractionMeta ?? {};
        const predictionFor = (fieldKey, predictedValue) => ml_prediction_1.MlPrediction.create(this.ids.next(), {
            requestId: request.id,
            modelType: enums_2.ModelType.NLP_EXTRACTOR,
            fieldKey,
            modelVersion: input.modelVersion,
            predictedValue,
        });
        await this.transaction.run(async () => {
            await this.requests.save(request);
            for (const [fieldKey, value] of Object.entries(accepted)) {
                await this.predictions.save(predictionFor(fieldKey, {
                    value,
                    ...(meta[fieldKey] ?? {}),
                    nullThreshold: input.nullThreshold,
                }));
            }
            for (const fieldKey of knownAbstained) {
                await this.predictions.save(predictionFor(fieldKey, {
                    value: null,
                    nullThreshold: input.nullThreshold,
                }));
            }
            for (const { fieldKey, reason } of rejected) {
                if (unknown.has(fieldKey))
                    continue;
                await this.predictions.save(predictionFor(fieldKey, {
                    value: input.filledData[fieldKey],
                    ...(meta[fieldKey] ?? {}),
                    nullThreshold: input.nullThreshold,
                    rejectedReason: reason,
                }));
            }
        });
        await this.notifier.confirmationRequired({
            requesterId: request.requesterId.toString(),
            requestId: request.id.toString(),
            referenceNo: request.referenceNo,
        });
        return {
            id: request.id.toString(),
            filledData: request.filledData ?? {},
            fieldsWritten: Object.keys(accepted).length,
            fieldsAbstained: knownAbstained.length,
            rejected,
        };
    }
};
exports.RecordExtractionHandler = RecordExtractionHandler;
exports.RecordExtractionHandler = RecordExtractionHandler = __decorate([
    (0, cqrs_1.CommandHandler)(record_extraction_command_1.RecordExtractionCommand),
    __param(0, (0, common_1.Inject)(tokens_1.REQUEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.TEMPLATE_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.ML_PREDICTION_REPOSITORY)),
    __param(3, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __param(4, (0, common_1.Inject)(tokens_1.TRANSACTION_RUNNER)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, notification_emitter_1.NotificationEmitter])
], RecordExtractionHandler);
//# sourceMappingURL=record-extraction.handler.js.map