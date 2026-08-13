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
exports.RevokeRoleFromUserHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const administrative_floor_policy_1 = require("../../policies/administrative-floor.policy");
const revoke_role_from_user_command_1 = require("./revoke-role-from-user.command");
let RevokeRoleFromUserHandler = class RevokeRoleFromUserHandler {
    roles;
    floor;
    constructor(roles, floor) {
        this.roles = roles;
        this.floor = floor;
    }
    async execute({ input }) {
        const userId = identifier_1.Identifier.of(input.userId);
        const roleId = identifier_1.Identifier.of(input.roleId);
        await this.floor.assertRevocationAllowed(userId, roleId);
        await this.roles.revokeFromUser({
            userId,
            roleId,
            departmentId: input.departmentId
                ? identifier_1.Identifier.of(input.departmentId)
                : undefined,
        });
    }
};
exports.RevokeRoleFromUserHandler = RevokeRoleFromUserHandler;
exports.RevokeRoleFromUserHandler = RevokeRoleFromUserHandler = __decorate([
    (0, cqrs_1.CommandHandler)(revoke_role_from_user_command_1.RevokeRoleFromUserCommand),
    __param(0, (0, common_1.Inject)(tokens_1.ROLE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, administrative_floor_policy_1.AdministrativeFloorPolicy])
], RevokeRoleFromUserHandler);
//# sourceMappingURL=revoke-role-from-user.handler.js.map