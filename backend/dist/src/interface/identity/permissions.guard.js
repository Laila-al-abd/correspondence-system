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
exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const identifier_1 = require("../../domain/shared/identifier");
const tokens_1 = require("../../application/tokens");
const permissions_decorator_1 = require("./permissions.decorator");
let PermissionsGuard = class PermissionsGuard {
    reflector;
    roles;
    constructor(reflector, roles) {
        this.reflector = reflector;
        this.roles = roles;
    }
    async canActivate(context) {
        const required = this.reflector.getAllAndOverride(permissions_decorator_1.PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
        const anyOf = this.reflector.getAllAndOverride(permissions_decorator_1.ANY_PERMISSION_KEY, [context.getHandler(), context.getClass()]);
        const requiresAll = (required?.length ?? 0) > 0;
        const requiresAny = (anyOf?.length ?? 0) > 0;
        if (!requiresAll && !requiresAny)
            return true;
        const request = context
            .switchToHttp()
            .getRequest();
        const userId = request.user?.userId;
        if (!userId)
            throw new common_1.UnauthorizedException('Not authenticated.');
        const granted = await this.roles.effectivePermissions(identifier_1.Identifier.of(userId));
        if (requiresAll) {
            const missing = (required ?? []).filter((code) => !granted.has(code));
            if (missing.length > 0)
                throw new common_1.ForbiddenException(`Missing required permission(s): ${missing.join(', ')}`);
        }
        if (requiresAny && !(anyOf ?? []).some((code) => granted.has(code)))
            throw new common_1.ForbiddenException(`Requires one of: ${(anyOf ?? []).join(', ')}`);
        return true;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(tokens_1.ROLE_REPOSITORY)),
    __metadata("design:paramtypes", [core_1.Reflector, Object])
], PermissionsGuard);
//# sourceMappingURL=permissions.guard.js.map