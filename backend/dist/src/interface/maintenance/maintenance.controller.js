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
exports.MaintenanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const storage_reconciliation_service_1 = require("../../infrastructure/storage/storage-reconciliation.service");
const permissions_decorator_1 = require("../identity/permissions.decorator");
let MaintenanceController = class MaintenanceController {
    reconciliation;
    constructor(reconciliation) {
        this.reconciliation = reconciliation;
    }
    runStorageReconciliation() {
        return this.reconciliation.sweep();
    }
};
exports.MaintenanceController = MaintenanceController;
__decorate([
    (0, common_1.Post)('storage-reconciliation'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('system.monitor'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MaintenanceController.prototype, "runStorageReconciliation", null);
exports.MaintenanceController = MaintenanceController = __decorate([
    (0, swagger_1.ApiTags)('maintenance'),
    (0, common_1.Controller)('maintenance'),
    __metadata("design:paramtypes", [storage_reconciliation_service_1.StorageReconciliationService])
], MaintenanceController);
//# sourceMappingURL=maintenance.controller.js.map