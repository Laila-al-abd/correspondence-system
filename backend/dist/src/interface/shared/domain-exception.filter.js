"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DomainExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const errors_1 = require("../../application/errors");
const domain_error_1 = require("../../domain/shared/domain-error");
let DomainExceptionFilter = DomainExceptionFilter_1 = class DomainExceptionFilter {
    logger = new common_1.Logger(DomainExceptionFilter_1.name);
    catch(exception, host) {
        const http = host.switchToHttp();
        const response = http.getResponse();
        const request = http.getRequest();
        const traceId = (0, node_crypto_1.randomUUID)();
        const path = request?.url;
        const send = (status, code, message) => {
            const body = {
                code,
                message,
                traceId,
                timestamp: new Date().toISOString(),
                path,
            };
            response.status(status).json(body);
        };
        if (exception instanceof errors_1.ApplicationError) {
            send(exception.status, exception.code, exception.message);
            return;
        }
        if (exception instanceof domain_error_1.DomainError) {
            send(400, exception.code, exception.message);
            return;
        }
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                send(status, 'HTTP_ERROR', res);
                return;
            }
            const payload = res;
            const message = Array.isArray(payload.message)
                ? payload.message.join(', ')
                : (payload.message ?? exception.message);
            const code = payload.error
                ? payload.error.toUpperCase().replace(/\s+/g, '_')
                : 'HTTP_ERROR';
            send(status, code, message);
            return;
        }
        this.logger.error(`Unhandled exception [${traceId}] ${path ?? ''}`.trim(), exception instanceof Error ? exception.stack : String(exception));
        send(500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
    }
};
exports.DomainExceptionFilter = DomainExceptionFilter;
exports.DomainExceptionFilter = DomainExceptionFilter = DomainExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], DomainExceptionFilter);
//# sourceMappingURL=domain-exception.filter.js.map