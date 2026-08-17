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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const assign_role_to_user_command_1 = require("../../application/identity/commands/assign-role-to-user/assign-role-to-user.command");
const revoke_role_from_user_command_1 = require("../../application/identity/commands/revoke-role-from-user/revoke-role-from-user.command");
const set_user_attribute_command_1 = require("../../application/identity/commands/set-user-attribute/set-user-attribute.command");
const clear_user_attribute_command_1 = require("../../application/identity/commands/clear-user-attribute/clear-user-attribute.command");
const create_user_command_1 = require("../../application/identity/commands/create-user/create-user.command");
const sync_users_command_1 = require("../../application/identity/commands/sync-users/sync-users.command");
const update_user_status_command_1 = require("../../application/identity/commands/update-user-status/update-user-status.command");
const assign_role_dto_1 = require("./dto/assign-role.dto");
const create_user_dto_1 = require("./dto/create-user.dto");
const set_user_attribute_dto_1 = require("./dto/set-user-attribute.dto");
const update_user_status_dto_1 = require("./dto/update-user-status.dto");
const permissions_decorator_1 = require("./permissions.decorator");
const current_user_decorator_1 = require("./current-user.decorator");
const list_users_dto_1 = require("./dto/list-users.dto");
const tokens_1 = require("../../application/tokens");
const errors_1 = require("../../application/errors");
let UsersController = class UsersController {
    commandBus;
    users;
    constructor(commandBus, users) {
        this.commandBus = commandBus;
        this.users = users;
    }
    list(dto) {
        return this.users.list({
            search: dto.search,
            userType: dto.userType,
            status: dto.status,
            departmentId: dto.departmentId,
            limit: dto.limit ? Number(dto.limit) : undefined,
            offset: dto.offset ? Number(dto.offset) : undefined,
        });
    }
    async getOne(userId) {
        const found = await this.users.getDetail(userId);
        if (!found)
            throw new errors_1.EntityNotFoundError('User', userId);
        return found;
    }
    create(dto, actorId) {
        return this.commandBus.execute(new create_user_command_1.CreateUserCommand({ ...dto, createdBy: actorId }));
    }
    syncFromDirectory(source) {
        return this.commandBus.execute(new sync_users_command_1.SyncUsersCommand(source));
    }
    assignRole(userId, dto, actorId) {
        return this.commandBus.execute(new assign_role_to_user_command_1.AssignRoleToUserCommand({
            userId,
            roleId: dto.roleId,
            departmentId: dto.departmentId,
            expiresAt: dto.expiresAt,
            reason: dto.reason,
            assignedBy: actorId,
        }));
    }
    revokeRole(userId, roleId, departmentId) {
        return this.commandBus.execute(new revoke_role_from_user_command_1.RevokeRoleFromUserCommand({ userId, roleId, departmentId }));
    }
    updateStatus(userId, dto) {
        return this.commandBus.execute(new update_user_status_command_1.UpdateUserStatusCommand({ userId, status: dto.status }));
    }
    setAttribute(userId, dto) {
        return this.commandBus.execute(new set_user_attribute_command_1.SetUserAttributeCommand({
            userId,
            attributeCode: dto.attributeCode,
            value: dto.value,
        }));
    }
    clearAttribute(userId, attributeCode) {
        return this.commandBus.execute(new clear_user_attribute_command_1.ClearUserAttributeCommand({ userId, attributeCode }));
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_users_dto_1.ListUsersDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Query)('source')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "syncFromDirectory", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('user.manage', 'role.manage'),
    (0, common_1.Post)(':userId/roles'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_role_dto_1.AssignRoleDto, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "assignRole", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('user.manage', 'role.manage'),
    (0, common_1.Delete)(':userId/roles/:roleId'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('roleId')),
    __param(2, (0, common_1.Query)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "revokeRole", null);
__decorate([
    (0, common_1.Patch)(':userId/status'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_status_dto_1.UpdateUserStatusDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)(':userId/attributes'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, set_user_attribute_dto_1.SetUserAttributeDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "setAttribute", null);
__decorate([
    (0, common_1.Delete)(':userId/attributes/:attributeCode'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('attributeCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "clearAttribute", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, permissions_decorator_1.RequirePermissions)('user.manage'),
    __param(1, (0, common_1.Inject)(tokens_1.USER_QUERY)),
    __metadata("design:paramtypes", [cqrs_1.CommandBus, Object])
], UsersController);
//# sourceMappingURL=users.controller.js.map