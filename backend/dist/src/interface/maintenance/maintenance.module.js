"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceModule = void 0;
const common_1 = require("@nestjs/common");
const tokens_1 = require("../../application/tokens");
const prisma_document_repository_1 = require("../../infrastructure/request/prisma-document.repository");
const minio_object_storage_1 = require("../../infrastructure/storage/minio-object-storage");
const storage_reconciliation_service_1 = require("../../infrastructure/storage/storage-reconciliation.service");
const maintenance_controller_1 = require("./maintenance.controller");
let MaintenanceModule = class MaintenanceModule {
};
exports.MaintenanceModule = MaintenanceModule;
exports.MaintenanceModule = MaintenanceModule = __decorate([
    (0, common_1.Module)({
        controllers: [maintenance_controller_1.MaintenanceController],
        providers: [
            { provide: tokens_1.OBJECT_STORAGE, useClass: minio_object_storage_1.MinioObjectStorage },
            { provide: tokens_1.DOCUMENT_REPOSITORY, useClass: prisma_document_repository_1.PrismaDocumentRepository },
            storage_reconciliation_service_1.StorageReconciliationService,
        ],
    })
], MaintenanceModule);
//# sourceMappingURL=maintenance.module.js.map