import { Module } from '@nestjs/common'
import { DOCUMENT_REPOSITORY, OBJECT_STORAGE } from '../../application/tokens'
import { PrismaDocumentRepository } from '../../infrastructure/request/prisma-document.repository'
import { MinioObjectStorage } from '../../infrastructure/storage/minio-object-storage'
import { StorageReconciliationService } from '../../infrastructure/storage/storage-reconciliation.service'
import { MaintenanceController } from './maintenance.controller'

/**
 * Composition root for operational maintenance.
 *
 * Binds OBJECT_STORAGE and DOCUMENT_REPOSITORY locally instead of importing
 * RequestModule, which exports both. Importing it would drag the entire request
 * runtime -- its controller, its SLA scheduler, and everything they depend on --
 * into a module whose only job is a background sweep, and would create a second
 * path by which those are instantiated. Both adapters here are stateless and
 * depend only on globally provided services (PrismaService, ConfigService), so
 * a second instance costs nothing and keeps the dependency graph flat.
 *
 * This mirrors the decision already taken in HealthModule for the same reason.
 */
@Module({
  controllers: [MaintenanceController],
  providers: [
    { provide: OBJECT_STORAGE, useClass: MinioObjectStorage },
    { provide: DOCUMENT_REPOSITORY, useClass: PrismaDocumentRepository },
    StorageReconciliationService,
  ],
})
export class MaintenanceModule {}
