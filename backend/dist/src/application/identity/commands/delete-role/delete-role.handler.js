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
exports.DeleteRoleHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const domain_error_1 = require("../../../../domain/shared/domain-error");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const delete_role_command_1 = require("./delete-role.command");
let DeleteRoleHandler = class DeleteRoleHandler {
    roles;
    constructor(roles) {
        this.roles = roles;
    }
    async execute({ input }) {
        const roleId = identifier_1.Identifier.of(input.roleId);
        const role = await this.roles.findById(roleId);
        if (!role)
            throw new errors_1.EntityNotFoundError('Role', input.roleId);
        const assignments = await this.roles.countAssignments(roleId);
        if (assignments > 0)
            throw new domain_error_1.InvariantViolationError(`This role is still assigned to ${assignments} account(s). Revoke those assignments before retiring it.`);
        role.softDelete();
        await this.roles.save(role);
    }
};
exports.DeleteRoleHandler = DeleteRoleHandler;
exports.DeleteRoleHandler = DeleteRoleHandler = __decorate([
    (0, cqrs_1.CommandHandler)(delete_role_command_1.DeleteRoleCommand),
    __param(0, (0, common_1.Inject)(tokens_1.ROLE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], DeleteRoleHandler);
//# sourceMappingURL=delete-role.handler.js.map