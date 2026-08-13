"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditContextInterceptor = void 0;
const common_1 = require("@nestjs/common");
const node_net_1 = require("node:net");
const request_context_1 = require("../../infrastructure/shared/request-context");
let AuditContextInterceptor = class AuditContextInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.userId;
        if (userId)
            request_context_1.RequestContextStore.set({ userId });
        const ipAddress = clientIp(request);
        if (ipAddress)
            request_context_1.RequestContextStore.set({ ipAddress });
        return next.handle();
    }
};
exports.AuditContextInterceptor = AuditContextInterceptor;
exports.AuditContextInterceptor = AuditContextInterceptor = __decorate([
    (0, common_1.Injectable)()
], AuditContextInterceptor);
const V4_IN_V6 = '::ffff:';
function clientIp(request) {
    const raw = request.ip ?? request.socket?.remoteAddress;
    if (!raw)
        return undefined;
    const value = raw.startsWith(V4_IN_V6) ? raw.slice(V4_IN_V6.length) : raw;
    return (0, node_net_1.isIP)(value) === 0 ? undefined : value;
}
//# sourceMappingURL=audit-context.interceptor.js.map