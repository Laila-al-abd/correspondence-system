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
exports.ActionTypeController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const list_action_types_query_1 = require("../../application/catalog/queries/list-action-types/list-action-types.query");
const permissions_decorator_1 = require("../identity/permissions.decorator");
let ActionTypeController = class ActionTypeController {
    queryBus;
    constructor(queryBus) {
        this.queryBus = queryBus;
    }
    list(onlyTerminal) {
        const filter = onlyTerminal === 'true' ? true : onlyTerminal === 'false' ? false : undefined;
        return this.queryBus.execute(new list_action_types_query_1.ListActionTypesQuery(filter));
    }
};
exports.ActionTypeController = ActionTypeController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('onlyTerminal')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActionTypeController.prototype, "list", null);
exports.ActionTypeController = ActionTypeController = __decorate([
    (0, common_1.Controller)('action-types'),
    (0, permissions_decorator_1.RequireAnyPermission)('workflow.manage', 'request.act'),
    __metadata("design:paramtypes", [cqrs_1.QueryBus])
], ActionTypeController);
//# sourceMappingURL=action-type.controller.js.map