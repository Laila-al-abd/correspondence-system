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
exports.GetDelegationHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const get_delegation_query_1 = require("./get-delegation.query");
let GetDelegationHandler = class GetDelegationHandler {
    delegations;
    constructor(delegations) {
        this.delegations = delegations;
    }
    async execute({ delegationId }) {
        const view = await this.delegations.getById(delegationId);
        if (!view)
            throw new errors_1.EntityNotFoundError('Delegation', delegationId);
        return view;
    }
};
exports.GetDelegationHandler = GetDelegationHandler;
exports.GetDelegationHandler = GetDelegationHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_delegation_query_1.GetDelegationQuery),
    __param(0, (0, common_1.Inject)(tokens_1.DELEGATION_QUERY)),
    __metadata("design:paramtypes", [Object])
], GetDelegationHandler);
//# sourceMappingURL=get-delegation.handler.js.map