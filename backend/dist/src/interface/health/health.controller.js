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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const dependency_health_service_1 = require("../../infrastructure/observability/dependency-health.service");
const permissions_decorator_1 = require("../identity/permissions.decorator");
const public_decorator_1 = require("../identity/public.decorator");
let HealthController = class HealthController {
    probes;
    constructor(probes) {
        this.probes = probes;
    }
    liveness() {
        return { status: 'ok' };
    }
    async detailed() {
        const report = await this.probes.check();
        if (report.status !== 'ok')
            throw new common_1.HttpException(report, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        return report;
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.SkipThrottle)(),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], HealthController.prototype, "liveness", null);
__decorate([
    (0, common_1.Get)('detailed'),
    (0, permissions_decorator_1.RequirePermissions)('system.monitor'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "detailed", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [dependency_health_service_1.DependencyHealthService])
], HealthController);
//# sourceMappingURL=health.controller.js.map