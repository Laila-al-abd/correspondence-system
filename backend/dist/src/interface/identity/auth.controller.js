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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const throttler_1 = require("@nestjs/throttler");
const register_user_command_1 = require("../../application/identity/commands/register-user/register-user.command");
const authenticate_user_command_1 = require("../../application/identity/commands/authenticate-user/authenticate-user.command");
const register_user_dto_1 = require("./dto/register-user.dto");
const login_dto_1 = require("./dto/login.dto");
const get_effective_permissions_query_1 = require("../../application/identity/queries/get-effective-permissions/get-effective-permissions.query");
const current_user_decorator_1 = require("./current-user.decorator");
const permissions_guard_1 = require("./permissions.guard");
const permissions_decorator_1 = require("./permissions.decorator");
const public_decorator_1 = require("./public.decorator");
let AuthController = class AuthController {
    commandBus;
    queryBus;
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async register(dto) {
        await this.commandBus.execute(new register_user_command_1.RegisterUserCommand(dto));
        return {
            status: 'accepted',
            message: 'If the address is not already registered, the account has been created. You can now sign in.',
        };
    }
    login(dto) {
        return this.commandBus.execute(new authenticate_user_command_1.AuthenticateUserCommand(dto.method ?? 'LOCAL', {
            email: dto.email,
            password: dto.password,
        }));
    }
    myPermissions(userId) {
        return this.queryBus.execute(new get_effective_permissions_query_1.GetEffectivePermissionsQuery(userId));
    }
    adminPing() {
        return { status: 'ok', message: 'You have the user.manage permission.' };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60_000 } }),
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_user_dto_1.RegisterUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60_000 } }),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me/permissions'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "myPermissions", null);
__decorate([
    (0, common_1.Get)('admin/ping'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('user.manage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "adminPing", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], AuthController);
//# sourceMappingURL=auth.controller.js.map