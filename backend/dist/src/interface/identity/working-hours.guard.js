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
var WorkingHoursGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkingHoursGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const business_hours_service_1 = require("../../application/observability/services/business-hours.service");
const permissions_decorator_1 = require("./permissions.decorator");
const TIME_RESTRICTED_PERMISSIONS = new Set([
    'request.act',
    'workflow.manage',
    'template.manage',
    'reports.view',
]);
let WorkingHoursGuard = WorkingHoursGuard_1 = class WorkingHoursGuard {
    reflector;
    businessHours;
    config;
    logger = new common_1.Logger(WorkingHoursGuard_1.name);
    constructor(reflector, businessHours, config) {
        this.reflector = reflector;
        this.businessHours = businessHours;
        this.config = config;
    }
    async canActivate(context) {
        const required = this.reflector.getAllAndOverride(permissions_decorator_1.PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
        if (!required || required.length === 0)
            return true;
        const request = context.switchToHttp().getRequest();
        this.assertAllowedNetwork(request);
        const timeBoxed = required.some((code) => TIME_RESTRICTED_PERMISSIONS.has(code));
        if (!timeBoxed)
            return true;
        await this.assertWorkingHours(request);
        return true;
    }
    assertAllowedNetwork(request) {
        const allowed = (this.config.get('STAFF_IP_ALLOWLIST') ?? '')
            .split(',')
            .map((entry) => entry.trim())
            .filter((entry) => entry.length > 0);
        if (allowed.length === 0)
            return;
        const client = normalizeIp(request.ip ?? request.socket?.remoteAddress);
        if (!client) {
            this.logger.warn(securityLine(request, 'network_allowlist'));
            throw new common_1.ForbiddenException('Staff actions are restricted to the university network.');
        }
        if (client === '127.0.0.1' || client === '::1')
            return;
        const permitted = allowed.some((entry) => client.startsWith(entry));
        if (!permitted) {
            this.logger.warn(securityLine(request, 'network_allowlist'));
            throw new common_1.ForbiddenException('Staff actions are only available from the university network.');
        }
    }
    async assertWorkingHours(request) {
        let open;
        try {
            open = await this.businessHours.isWorkingMoment(new Date());
        }
        catch (error) {
            const detail = error instanceof Error ? error.message : String(error);
            this.logger.warn(`${securityLine(request, 'working_hours', 'allowed')} ` +
                `reason=policy_unavailable detail="${detail}"`);
            return;
        }
        if (open)
            return;
        this.logger.warn(securityLine(request, 'working_hours'));
        throw new common_1.ForbiddenException(await this.closedMessage());
    }
    async closedMessage() {
        try {
            const policy = await this.businessHours.policy();
            const reopens = await this.businessHours.nextWorkingMoment(new Date());
            return (`Staff actions are only available during working hours: ` +
                `${(0, business_hours_service_1.describeDays)(policy.days)}, ${policy.start}-${policy.end} ` +
                `(${policy.timezone}). Next available at ${reopens.toISOString()}.`);
        }
        catch {
            return 'Staff actions are only available during working hours.';
        }
    }
};
exports.WorkingHoursGuard = WorkingHoursGuard;
exports.WorkingHoursGuard = WorkingHoursGuard = WorkingHoursGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        business_hours_service_1.BusinessHoursService,
        config_1.ConfigService])
], WorkingHoursGuard);
function securityLine(request, rule, outcome = 'denied') {
    const client = normalizeIp(request.ip ?? request.socket?.remoteAddress);
    const route = `${request.method ?? '?'} ${request.originalUrl ?? request.url ?? '?'}`;
    return [
        `access ${outcome}`,
        `rule=${rule}`,
        `userId=${request.user?.userId ?? 'anonymous'}`,
        `ip=${client ?? 'unknown'}`,
        `route="${route}"`,
        `at=${new Date().toISOString()}`,
    ].join(' ');
}
function normalizeIp(value) {
    if (!value)
        return undefined;
    return value.startsWith('::ffff:') ? value.slice('::ffff:'.length) : value;
}
//# sourceMappingURL=working-hours.guard.js.map