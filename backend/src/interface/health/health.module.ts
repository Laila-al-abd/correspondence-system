import { Module } from '@nestjs/common'
import { OBJECT_STORAGE } from '../../application/tokens'
import { DependencyHealthService } from '../../infrastructure/observability/dependency-health.service'
import { MinioObjectStorage } from '../../infrastructure/storage/minio-object-storage'
import { HealthController } from './health.controller'

/**
 * Health checks, kept in their own module rather than bolted onto AppController.
 *
 * PrismaService arrives through the global PersistenceModule. Object storage is
 * provided locally: MinioObjectStorage holds only a client and its config, so a
 * second instance costs nothing, and importing RequestModule merely to borrow
 * its binding would make the health check depend on the entire request feature
 * booting correctly -- precisely the thing a health check should be able to
 * report on rather than depend on.
 */
@Module({
  controllers: [HealthController],
  providers: [
    DependencyHealthService,
    { provide: OBJECT_STORAGE, useClass: MinioObjectStorage },
  ],
})
export class HealthModule {}
