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
exports.CreateRoleHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const role_1 = require("../../../../domain/identity/role");
const domain_error_1 = require("../../../../domain/shared/domain-error");
const localized_text_1 = require("../../../../domain/shared/localized-text");
const tokens_1 = require("../../../tokens");
const create_role_command_1 = require("./create-role.command");
let CreateRoleHandler = class CreateRoleHandler {
    roles;
    ids;
    constructor(roles, ids) {
        this.roles = roles;
        this.ids = ids;
    }
    async execute({ input }) {
        const codes = [...new Set(input.permissionCodes ?? [])];
        const unknown = await this.roles.unknownPermissionCodes(codes);
        if (unknown.length > 0)
            throw new domain_error_1.InvariantViolationError(`No such permission(s): ${unknown.join(', ')}.`);
        const role = role_1.Role.create(this.ids.next(), localized_text_1.LocalizedText.create(input.name.ar, input.name.en), input.description
            ? localized_text_1.LocalizedText.create(input.description.ar, input.description.en)
            : undefined);
        for (const code of codes)
            role.grant(code);
        await this.roles.save(role);
        return { roleId: role.id.toString() };
    }
};
exports.CreateRoleHandler = CreateRoleHandler;
exports.CreateRoleHandler = CreateRoleHandler = __decorate([
    (0, cqrs_1.CommandHandler)(create_role_command_1.CreateRoleCommand),
    __param(0, (0, common_1.Inject)(tokens_1.ROLE_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __metadata("design:paramtypes", [Object, Object])
], CreateRoleHandler);
//# sourceMappingURL=create-role.handler.js.map