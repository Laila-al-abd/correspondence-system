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
exports.ChangeRequestPriorityHandler = exports.CHANGE_PRIORITY_ACTION_CODE = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const enums_1 = require("../../../../domain/request/enums");
const request_action_1 = require("../../../../domain/request/request-action");
const domain_error_1 = require("../../../../domain/shared/domain-error");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const event_recorder_1 = require("../../../observability/services/event-recorder");
const change_request_priority_command_1 = require("./change-request-priority.command");
exports.CHANGE_PRIORITY_ACTION_CODE = 'CHANGE_PRIORITY';
const OPEN_STATUSES = [
    enums_1.RequestStatus.DRAFT,
    enums_1.RequestStatus.IN_PROGRESS,
    enums_1.RequestStatus.ON_HOLD,
];
let ChangeRequestPriorityHandler = class ChangeRequestPriorityHandler {
    requests;
    actions;
    actionTypes;
    ids;
    transaction;
    events;
    constructor(requests, actions, actionTypes, ids, transaction, events) {
        this.requests = requests;
        this.actions = actions;
        this.actionTypes = actionTypes;
        this.ids = ids;
        this.transaction = transaction;
        this.events = events;
    }
    async execute({ input, }) {
        const request = await this.requests.findById(identifier_1.Identifier.of(input.requestId));
        if (!request)
            throw new errors_1.EntityNotFoundError('Request', input.requestId);
        if (!OPEN_STATUSES.includes(request.status))
            throw new domain_error_1.InvariantViolationError(`A request that is ${request.status} cannot be re-prioritised.`);
        const actionType = await this.actionTypes.findByCode(exports.CHANGE_PRIORITY_ACTION_CODE);
        if (!actionType)
            throw new errors_1.EntityNotFoundError('ActionType', exports.CHANGE_PRIORITY_ACTION_CODE);
        const previousPriority = request.snapshot().priority;
        const next = input.priority;
        request.changePriority(next);
        await this.transaction.run(async () => {
            await this.requests.save(request);
            await this.actions.append(request_action_1.RequestAction.create(this.ids.next(), {
                requestId: request.id,
                actorId: identifier_1.Identifier.of(input.actorId),
                actionTypeId: actionType.id,
                comment: `${previousPriority} -> ${next}: ${input.reason}`,
            }));
            await this.events.actionTaken({
                requestId: request.id.toString(),
                actorId: input.actorId,
                actionTypeId: actionType.id.toString(),
            });
        });
        return {
            id: request.id.toString(),
            previousPriority,
            priority: next,
        };
    }
};
exports.ChangeRequestPriorityHandler = ChangeRequestPriorityHandler;
exports.ChangeRequestPriorityHandler = ChangeRequestPriorityHandler = __decorate([
    (0, cqrs_1.CommandHandler)(change_request_priority_command_1.ChangeRequestPriorityCommand),
    __param(0, (0, common_1.Inject)(tokens_1.REQUEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.REQUEST_ACTION_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.ACTION_TYPE_REPOSITORY)),
    __param(3, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __param(4, (0, common_1.Inject)(tokens_1.TRANSACTION_RUNNER)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, event_recorder_1.EventRecorder])
], ChangeRequestPriorityHandler);
//# sourceMappingURL=change-request-priority.handler.js.map