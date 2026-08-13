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
exports.RevokePermissionFromRoleHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const administrative_floor_policy_1 = require("../../policies/administrative-floor.policy");
const revoke_permission_from_role_command_1 = require("./revoke-permission-from-role.command");
let RevokePermissionFromRoleHandler = class RevokePermissionFromRoleHandler {
    roles;
    floor;
    constructor(roles, floor) {
        this.roles = roles;
        this.floor = floor;
    }
    async execute({ input }) {
        const roleId = identifier_1.Identifier.of(input.roleId);
        const role = await this.roles.findById(roleId);
        if (!role)
            throw new errors_1.EntityNotFoundError('Role', input.roleId);
        await this.floor.assertRoleMayLosePermission(roleId, input.permissionCode);
        role.revoke(input.permissionCode);
        await this.roles.save(role);
    }
};
exports.RevokePermissionFromRoleHandler = RevokePermissionFromRoleHandler;
exports.RevokePermissionFromRoleHandler = RevokePermissionFromRoleHandler = __decorate([
    (0, cqrs_1.CommandHandler)(revoke_permission_from_role_command_1.RevokePermissionFromRoleCommand),
    __param(0, (0, common_1.Inject)(tokens_1.ROLE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, administrative_floor_policy_1.AdministrativeFloorPolicy])
], RevokePermissionFromRoleHandler);
//# sourceMappingURL=revoke-permission-from-role.handler.js.map