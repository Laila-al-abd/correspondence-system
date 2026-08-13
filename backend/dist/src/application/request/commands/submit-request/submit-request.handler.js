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
exports.SubmitRequestHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const request_1 = require("../../../../domain/request/request");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const event_recorder_1 = require("../../../observability/services/event-recorder");
const request_stage_1 = require("../../queries/views/request-stage");
const submit_request_command_1 = require("./submit-request.command");
let SubmitRequestHandler = class SubmitRequestHandler {
    requests;
    ids;
    referenceNumbers;
    transactions;
    events;
    constructor(requests, ids, referenceNumbers, transactions, events) {
        this.requests = requests;
        this.ids = ids;
        this.referenceNumbers = referenceNumbers;
        this.transactions = transactions;
        this.events = events;
    }
    async execute(command) {
        return this.transactions.run(() => this.createRequest(command));
    }
    async createRequest({ input, }) {
        const referenceNo = await this.referenceNumbers.next();
        const request = request_1.Request.create(this.ids.next(), {
            requesterId: identifier_1.Identifier.of(input.requesterId),
            referenceNo,
            rawText: input.rawText,
        });
        if (input.filledData)
            request.setFilledData(input.filledData);
        await this.requests.save(request);
        await this.events.statusChanged({
            requestId: request.id.toString(),
            to: (0, request_stage_1.stageOfRequest)(request),
            actorId: input.requesterId,
        });
        return { id: request.id.toString(), referenceNo };
    }
};
exports.SubmitRequestHandler = SubmitRequestHandler;
exports.SubmitRequestHandler = SubmitRequestHandler = __decorate([
    (0, cqrs_1.CommandHandler)(submit_request_command_1.SubmitRequestCommand),
    __param(0, (0, common_1.Inject)(tokens_1.REQUEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __param(2, (0, common_1.Inject)(tokens_1.REFERENCE_NUMBER_GENERATOR)),
    __param(3, (0, common_1.Inject)(tokens_1.TRANSACTION_RUNNER)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, event_recorder_1.EventRecorder])
], SubmitRequestHandler);
//# sourceMappingURL=submit-request.handler.js.map