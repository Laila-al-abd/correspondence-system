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
exports.AssignRoleToUserHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const assign_role_to_user_command_1 = require("./assign-role-to-user.command");
let AssignRoleToUserHandler = class AssignRoleToUserHandler {
    users;
    roles;
    departments;
    constructor(users, roles, departments) {
        this.users = users;
        this.roles = roles;
        this.departments = departments;
    }
    async execute({ input, }) {
        const userId = identifier_1.Identifier.of(input.userId);
        if (!(await this.users.findById(userId)))
            throw new errors_1.EntityNotFoundError('User', input.userId);
        const roleId = identifier_1.Identifier.of(input.roleId);
        if (!(await this.roles.findById(roleId)))
            throw new errors_1.EntityNotFoundError('Role', input.roleId);
        let departmentId;
        if (input.departmentId) {
            departmentId = identifier_1.Identifier.of(input.departmentId);
            if (!(await this.departments.findById(departmentId)))
                throw new errors_1.EntityNotFoundError('Department', input.departmentId);
        }
        await this.roles.assignToUser({
            userId,
            roleId,
            departmentId,
            reason: input.reason,
            expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
            assignedBy: input.assignedBy
                ? identifier_1.Identifier.of(input.assignedBy)
                : undefined,
        });
        return {
            userId: input.userId,
            roleId: input.roleId,
            departmentId: input.departmentId,
        };
    }
};
exports.AssignRoleToUserHandler = AssignRoleToUserHandler;
exports.AssignRoleToUserHandler = AssignRoleToUserHandler = __decorate([
    (0, cqrs_1.CommandHandler)(assign_role_to_user_command_1.AssignRoleToUserCommand),
    __param(0, (0, common_1.Inject)(tokens_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.ROLE_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.DEPARTMENT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, Object])
], AssignRoleToUserHandler);
//# sourceMappingURL=assign-role-to-user.handler.js.map