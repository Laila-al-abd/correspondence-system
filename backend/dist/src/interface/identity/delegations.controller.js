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
exports.DelegationsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const grant_delegation_command_1 = require("../../application/identity/commands/grant-delegation/grant-delegation.command");
const revoke_delegation_command_1 = require("../../application/identity/commands/revoke-delegation/revoke-delegation.command");
const list_delegations_query_1 = require("../../application/identity/queries/list-delegations/list-delegations.query");
const get_delegation_query_1 = require("../../application/identity/queries/get-delegation/get-delegation.query");
const grant_delegation_dto_1 = require("./dto/grant-delegation.dto");
const list_delegations_dto_1 = require("./dto/list-delegations.dto");
const permissions_decorator_1 = require("./permissions.decorator");
const page_query_dto_1 = require("../shared/dto/page-query.dto");
let DelegationsController = class DelegationsController {
    commandBus;
    queryBus;
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    list(dto) {
        return this.queryBus.execute(new list_delegations_query_1.ListDelegationsQuery({
            delegatorId: dto.delegatorId,
            delegateId: dto.delegateId,
            activeOnly: dto.activeOnly === 'true',
            onDate: dto.onDate,
            limit: (0, page_query_dto_1.toNumber)(dto.limit),
            offset: (0, page_query_dto_1.toNumber)(dto.offset),
        }));
    }
    getOne(id) {
        return this.queryBus.execute(new get_delegation_query_1.GetDelegationQuery(id));
    }
    grant(dto) {
        return this.commandBus.execute(new grant_delegation_command_1.GrantDelegationCommand({
            delegatorId: dto.delegatorId,
            delegateId: dto.delegateId,
            startDate: dto.startDate,
            endDate: dto.endDate,
            reason: dto.reason,
        }));
    }
    revoke(id) {
        return this.commandBus.execute(new revoke_delegation_command_1.RevokeDelegationCommand(id));
    }
};
exports.DelegationsController = DelegationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_delegations_dto_1.ListDelegationsDto]),
    __metadata("design:returntype", Promise)
], DelegationsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DelegationsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [grant_delegation_dto_1.GrantDelegationDto]),
    __metadata("design:returntype", Promise)
], DelegationsController.prototype, "grant", null);
__decorate([
    (0, common_1.Post)(':id/revoke'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DelegationsController.prototype, "revoke", null);
exports.DelegationsController = DelegationsController = __decorate([
    (0, common_1.Controller)('delegations'),
    (0, permissions_decorator_1.RequirePermissions)('user.manage'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], DelegationsController);
//# sourceMappingURL=delegations.controller.js.map