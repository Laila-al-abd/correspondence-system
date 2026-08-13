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
exports.RolesController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const create_role_command_1 = require("../../application/identity/commands/create-role/create-role.command");
const update_role_command_1 = require("../../application/identity/commands/update-role/update-role.command");
const delete_role_command_1 = require("../../application/identity/commands/delete-role/delete-role.command");
const grant_permission_to_role_command_1 = require("../../application/identity/commands/grant-permission-to-role/grant-permission-to-role.command");
const revoke_permission_from_role_command_1 = require("../../application/identity/commands/revoke-permission-from-role/revoke-permission-from-role.command");
const tokens_1 = require("../../application/tokens");
const errors_1 = require("../../application/errors");
const create_role_dto_1 = require("./dto/create-role.dto");
const update_role_dto_1 = require("./dto/update-role.dto");
const grant_permission_dto_1 = require("./dto/grant-permission.dto");
const current_user_decorator_1 = require("./current-user.decorator");
const permissions_decorator_1 = require("./permissions.decorator");
let RolesController = class RolesController {
    commandBus;
    roles;
    constructor(commandBus, roles) {
        this.commandBus = commandBus;
        this.roles = roles;
    }
    list() {
        return this.roles.listRoles();
    }
    permissions() {
        return this.roles.listPermissionGroups();
    }
    async getOne(roleId) {
        const found = await this.roles.getRole(roleId);
        if (!found)
            throw new errors_1.EntityNotFoundError('Role', roleId);
        return found;
    }
    create(dto, actorId) {
        return this.commandBus.execute(new create_role_command_1.CreateRoleCommand({
            name: dto.name,
            description: dto.description,
            permissionCodes: dto.permissionCodes,
            createdBy: actorId,
        }));
    }
    update(roleId, dto) {
        return this.commandBus.execute(new update_role_command_1.UpdateRoleCommand({
            roleId,
            name: dto.name,
            description: dto.description,
        }));
    }
    remove(roleId) {
        return this.commandBus.execute(new delete_role_command_1.DeleteRoleCommand({ roleId }));
    }
    grant(roleId, dto) {
        return this.commandBus.execute(new grant_permission_to_role_command_1.GrantPermissionToRoleCommand({ roleId, permissionCode: dto.code }));
    }
    revoke(roleId, code) {
        return this.commandBus.execute(new revoke_permission_from_role_command_1.RevokePermissionFromRoleCommand({ roleId, permissionCode: code }));
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('permissions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "permissions", null);
__decorate([
    (0, common_1.Get)(':roleId'),
    __param(0, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_role_dto_1.CreateRoleDto, String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':roleId'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_role_dto_1.UpdateRoleDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':roleId'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':roleId/permissions'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, grant_permission_dto_1.GrantPermissionDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "grant", null);
__decorate([
    (0, common_1.Delete)(':roleId/permissions/:code'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "revoke", null);
exports.RolesController = RolesController = __decorate([
    (0, common_1.Controller)('roles'),
    (0, permissions_decorator_1.RequirePermissions)('role.manage'),
    __param(1, (0, common_1.Inject)(tokens_1.ROLE_QUERY)),
    __metadata("design:paramtypes", [cqrs_1.CommandBus, Object])
], RolesController);
//# sourceMappingURL=roles.controller.js.map