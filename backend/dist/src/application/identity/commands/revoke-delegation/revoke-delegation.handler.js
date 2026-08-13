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
exports.RevokeDelegationHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const notification_emitter_1 = require("../../../observability/services/notification-emitter");
const revoke_delegation_command_1 = require("./revoke-delegation.command");
let RevokeDelegationHandler = class RevokeDelegationHandler {
    delegations;
    delegationView;
    notifier;
    constructor(delegations, delegationView, notifier) {
        this.delegations = delegations;
        this.delegationView = delegationView;
        this.notifier = notifier;
    }
    async execute({ delegationId, }) {
        const delegation = await this.delegations.findById(identifier_1.Identifier.of(delegationId));
        if (!delegation)
            throw new errors_1.EntityNotFoundError('Delegation', delegationId);
        delegation.revoke();
        await this.delegations.save(delegation);
        const view = await this.delegationView.getById(delegationId);
        if (!view)
            throw new errors_1.EntityNotFoundError('Delegation', delegationId);
        await this.notifier.delegationRevoked({
            delegatorId: view.delegatorId,
            delegateId: view.delegateId,
            delegatorName: view.delegatorName.en ?? view.delegatorName.ar,
            delegateName: view.delegateName.en ?? view.delegateName.ar,
        });
        return view;
    }
};
exports.RevokeDelegationHandler = RevokeDelegationHandler;
exports.RevokeDelegationHandler = RevokeDelegationHandler = __decorate([
    (0, cqrs_1.CommandHandler)(revoke_delegation_command_1.RevokeDelegationCommand),
    __param(0, (0, common_1.Inject)(tokens_1.DELEGATION_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.DELEGATION_QUERY)),
    __metadata("design:paramtypes", [Object, Object, notification_emitter_1.NotificationEmitter])
], RevokeDelegationHandler);
//# sourceMappingURL=revoke-delegation.handler.js.map