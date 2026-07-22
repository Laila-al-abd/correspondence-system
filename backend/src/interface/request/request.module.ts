import { Module } from '@nestjs/common'
import {
  DOCUMENT_REPOSITORY,
  OBJECT_STORAGE,
  PAYMENT_REPOSITORY,
  REQUEST_ACTION_REPOSITORY,
  REQUEST_REPOSITORY,
} from '../../application/tokens'
import { PrismaRequestRepository } from '../../infrastructure/request/prisma-request.repository'
import { PrismaRequestActionRepository } from '../../infrastructure/request/prisma-request-action.repository'
import { PrismaPaymentRepository } from '../../infrastructure/request/prisma-payment.repository'
import { PrismaDocumentRepository } from '../../infrastructure/request/prisma-document.repository'
import { MinioObjectStorage } from '../../infrastructure/storage/minio-object-storage'

/**
 * Request runtime composition root. Binds the request-side ports — the request
 * aggregate, its audit-action log, payments, and documents — plus the
 * object-storage port to their adapters, so the use cases that run a request
 * through its workflow can be built on top.
 */
@Module({
  providers: [
    { provide: REQUEST_REPOSITORY, useClass: PrismaRequestRepository },
    {
      provide: REQUEST_ACTION_REPOSITORY,
      useClass: PrismaRequestActionRepository,
    },
    { provide: PAYMENT_REPOSITORY, useClass: PrismaPaymentRepository },
    { provide: DOCUMENT_REPOSITORY, useClass: PrismaDocumentRepository },
    { provide: OBJECT_STORAGE, useClass: MinioObjectStorage },
  ],
  exports: [
    REQUEST_REPOSITORY,
    REQUEST_ACTION_REPOSITORY,
    PAYMENT_REPOSITORY,
    DOCUMENT_REPOSITORY,
    OBJECT_STORAGE,
  ],
})
export class RequestModule {}
