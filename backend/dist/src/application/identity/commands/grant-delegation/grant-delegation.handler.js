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
exports.GrantDelegationHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const delegation_1 = require("../../../../domain/identity/delegation");
const identifier_1 = require("../../../../domain/shared/identifier");
const domain_error_1 = require("../../../../domain/shared/domain-error");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const notification_emitter_1 = require("../../../observability/services/notification-emitter");
const grant_delegation_command_1 = require("./grant-delegation.command");
let GrantDelegationHandler = class GrantDelegationHandler {
    users;
    delegations;
    delegationView;
    ids;
    notifier;
    constructor(users, delegations, delegationView, ids, notifier) {
        this.users = users;
        this.delegations = delegations;
        this.delegationView = delegationView;
        this.ids = ids;
        this.notifier = notifier;
    }
    async execute({ input }) {
        const delegatorId = identifier_1.Identifier.of(input.delegatorId);
        if (!(await this.users.findById(delegatorId)))
            throw new errors_1.EntityNotFoundError('User', input.delegatorId);
        const delegateId = identifier_1.Identifier.of(input.delegateId);
        if (!(await this.users.findById(delegateId)))
            throw new errors_1.EntityNotFoundError('User', input.delegateId);
        const start = parseDate(input.startDate);
        const end = parseDate(input.endDate);
        if (await this.delegations.activeToDelegate(delegatorId, start))
            throw new domain_error_1.InvariantViolationError('You are currently acting on behalf of someone else and cannot pass that authority on. Delegation is limited to one step.');
        if (await this.delegations.activeFor(delegateId, start))
            throw new domain_error_1.InvariantViolationError('The chosen delegate has already delegated their own authority to someone else. Delegation is limited to one step.');
        const delegation = delegation_1.Delegation.create(this.ids.next(), {
            delegatorId,
            delegateId,
            start,
            end,
            reason: input.reason,
        });
        await this.delegations.save(delegation);
        const view = await this.delegationView.getById(delegation.id.toString());
        if (!view)
            throw new errors_1.EntityNotFoundError('Delegation', delegation.id.toString());
        await this.notifier.delegationGranted({
            delegatorId: view.delegatorId,
            delegateId: view.delegateId,
            delegatorName: view.delegatorName.en ?? view.delegatorName.ar,
            delegateName: view.delegateName.en ?? view.delegateName.ar,
            startDate: view.startDate,
            endDate: view.endDate,
        });
        return view;
    }
};
exports.GrantDelegationHandler = GrantDelegationHandler;
exports.GrantDelegationHandler = GrantDelegationHandler = __decorate([
    (0, cqrs_1.CommandHandler)(grant_delegation_command_1.GrantDelegationCommand),
    __param(0, (0, common_1.Inject)(tokens_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.DELEGATION_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.DELEGATION_QUERY)),
    __param(3, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, notification_emitter_1.NotificationEmitter])
], GrantDelegationHandler);
function parseDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        throw new domain_error_1.InvariantViolationError(`Invalid date: ${value}`);
    return date;
}
//# sourceMappingURL=grant-delegation.handler.js.map