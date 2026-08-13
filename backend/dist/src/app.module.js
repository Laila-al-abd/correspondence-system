"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const persistence_module_1 = require("./infrastructure/persistence/persistence.module");
const catalog_module_1 = require("./interface/catalog/catalog.module");
const identity_module_1 = require("./interface/identity/identity.module");
const organization_module_1 = require("./interface/organization/organization.module");
const workflow_module_1 = require("./interface/workflow/workflow.module");
const request_module_1 = require("./interface/request/request.module");
const observability_module_1 = require("./interface/observability/observability.module");
const access_module_1 = require("./interface/access/access.module");
const reports_module_1 = require("./interface/reporting/reports.module");
const audit_context_interceptor_1 = require("./interface/shared/audit-context.interceptor");
const rate_limit_module_1 = require("./interface/shared/rate-limit.module");
const health_module_1 = require("./interface/health/health.module");
const maintenance_module_1 = require("./interface/maintenance/maintenance.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            rate_limit_module_1.RateLimitModule,
            persistence_module_1.PersistenceModule,
            health_module_1.HealthModule,
            catalog_module_1.CatalogModule,
            identity_module_1.IdentityModule,
            organization_module_1.OrganizationModule,
            workflow_module_1.WorkflowModule,
            request_module_1.RequestModule,
            observability_module_1.ObservabilityModule,
            maintenance_module_1.MaintenanceModule,
            access_module_1.AccessModule,
            reports_module_1.ReportsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_INTERCEPTOR, useClass: audit_context_interceptor_1.AuditContextInterceptor },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map