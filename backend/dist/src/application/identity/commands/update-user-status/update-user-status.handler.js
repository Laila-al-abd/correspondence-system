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
exports.UpdateUserStatusHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const enums_1 = require("../../../../domain/identity/enums");
const domain_error_1 = require("../../../../domain/shared/domain-error");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const administrative_floor_policy_1 = require("../../policies/administrative-floor.policy");
const update_user_status_command_1 = require("./update-user-status.command");
let UpdateUserStatusHandler = class UpdateUserStatusHandler {
    users;
    floor;
    constructor(users, floor) {
        this.users = users;
        this.floor = floor;
    }
    async execute({ input, }) {
        const userId = identifier_1.Identifier.of(input.userId);
        const user = await this.users.findById(userId);
        if (!user)
            throw new errors_1.EntityNotFoundError('User', input.userId);
        const target = this.parse(input.status);
        if (user.status === target)
            return { userId: userId.toString(), status: target };
        if (target !== enums_1.UserStatus.ACTIVE)
            await this.floor.assertNotLastHolder(userId);
        if (target === enums_1.UserStatus.ACTIVE)
            user.activate();
        else if (target === enums_1.UserStatus.SUSPENDED)
            user.suspend();
        else
            user.deactivate();
        await this.users.save(user);
        return { userId: userId.toString(), status: user.status };
    }
    parse(value) {
        const upper = value.trim().toUpperCase();
        if (upper === enums_1.UserStatus.ACTIVE)
            return enums_1.UserStatus.ACTIVE;
        if (upper === enums_1.UserStatus.SUSPENDED)
            return enums_1.UserStatus.SUSPENDED;
        if (upper === enums_1.UserStatus.INACTIVE)
            return enums_1.UserStatus.INACTIVE;
        throw new domain_error_1.InvariantViolationError('status must be ACTIVE, SUSPENDED, or INACTIVE.');
    }
};
exports.UpdateUserStatusHandler = UpdateUserStatusHandler;
exports.UpdateUserStatusHandler = UpdateUserStatusHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_user_status_command_1.UpdateUserStatusCommand),
    __param(0, (0, common_1.Inject)(tokens_1.USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, administrative_floor_policy_1.AdministrativeFloorPolicy])
], UpdateUserStatusHandler);
//# sourceMappingURL=update-user-status.handler.js.map