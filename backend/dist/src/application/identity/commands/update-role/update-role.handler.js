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
exports.UpdateRoleHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const localized_text_1 = require("../../../../domain/shared/localized-text");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const update_role_command_1 = require("./update-role.command");
let UpdateRoleHandler = class UpdateRoleHandler {
    roles;
    constructor(roles) {
        this.roles = roles;
    }
    async execute({ input }) {
        const role = await this.roles.findById(identifier_1.Identifier.of(input.roleId));
        if (!role)
            throw new errors_1.EntityNotFoundError('Role', input.roleId);
        role.rename(localized_text_1.LocalizedText.create(input.name.ar, input.name.en), input.description
            ? localized_text_1.LocalizedText.create(input.description.ar, input.description.en)
            : undefined);
        await this.roles.save(role);
    }
};
exports.UpdateRoleHandler = UpdateRoleHandler;
exports.UpdateRoleHandler = UpdateRoleHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_role_command_1.UpdateRoleCommand),
    __param(0, (0, common_1.Inject)(tokens_1.ROLE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], UpdateRoleHandler);
//# sourceMappingURL=update-role.handler.js.map