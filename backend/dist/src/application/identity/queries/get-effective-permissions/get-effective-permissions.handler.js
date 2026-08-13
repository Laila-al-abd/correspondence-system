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
exports.GetEffectivePermissionsHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const errors_1 = require("../../../errors");
const tokens_1 = require("../../../tokens");
const get_effective_permissions_query_1 = require("./get-effective-permissions.query");
let GetEffectivePermissionsHandler = class GetEffectivePermissionsHandler {
    roles;
    users;
    constructor(roles, users) {
        this.roles = roles;
        this.users = users;
    }
    async execute(query) {
        const userId = identifier_1.Identifier.of(query.userId);
        const user = await this.users.findById(userId);
        if (!user)
            throw new errors_1.EntityNotFoundError('User', query.userId);
        const codes = await this.roles.effectivePermissions(userId);
        return [...codes].sort();
    }
};
exports.GetEffectivePermissionsHandler = GetEffectivePermissionsHandler;
exports.GetEffectivePermissionsHandler = GetEffectivePermissionsHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_effective_permissions_query_1.GetEffectivePermissionsQuery),
    __param(0, (0, common_1.Inject)(tokens_1.ROLE_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], GetEffectivePermissionsHandler);
//# sourceMappingURL=get-effective-permissions.handler.js.map