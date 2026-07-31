import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CatalogModule } from '../catalog/catalog.module'
import { ObservabilityModule } from '../observability/observability.module'
import {
  ASSIGNEE_DIRECTORY,
  DOCUMENT_REPOSITORY,
  ID_GENERATOR,
  OBJECT_STORAGE,
  PAYMENT_REPOSITORY,
  REFERENCE_NUMBER_GENERATOR,
  REQUEST_ACTION_REPOSITORY,
  REQUEST_REPOSITORY,
  SLA_SCAN,
  WORKFLOW_PATH_REPOSITORY,
} from '../../application/tokens'
import { PrismaRequestRepository } from '../../infrastructure/request/prisma-request.repository'
import { PrismaRequestActionRepository } from '../../infrastructure/request/prisma-request-action.repository'
import { PrismaPaymentRepository } from '../../infrastructure/request/prisma-payment.repository'
import { PrismaDocumentRepository } from '../../infrastructure/request/prisma-document.repository'
import { PrismaWorkflowPathRepository } from '../../infrastructure/workflow/prisma-workflow-path.repository'
import { MinioObjectStorage } from '../../infrastructure/storage/minio-object-storage'
import { UuidV7IdGenerator } from '../../infrastructure/shared/uuid-v7-id.generator'
import { PrismaReferenceNumberGenerator } from '../../infrastructure/shared/prisma-reference-number.generator'
import { SubmitRequestHandler } from '../../application/request/commands/submit-request/submit-request.handler'
import { ClassifyRequestByModelHandler } from '../../application/request/commands/classify-request-by-model/classify-request-by-model.handler'
import { ClassifyRequestByHumanHandler } from '../../application/request/commands/classify-request-by-human/classify-request-by-human.handler'
import { StartRequestWorkflowHandler } from '../../application/request/commands/start-request-workflow/start-request-workflow.handler'
import { AssignStepHandler } from '../../application/request/commands/assign-step/assign-step.handler'
import { ActOnStepHandler } from '../../application/request/commands/act-on-step/act-on-step.handler'
import { UploadDocumentHandler } from '../../application/request/commands/upload-document/upload-document.handler'
import { GetRequestHandler } from '../../application/request/queries/get-request/get-request.handler'
import { GetRequestByReferenceHandler } from '../../application/request/queries/get-request-by-reference/get-request-by-reference.handler'
import { ListMyRequestsHandler } from '../../application/request/queries/list-my-requests/list-my-requests.handler'
import { ListAssignedRequestsHandler } from '../../application/request/queries/list-assigned-requests/list-assigned-requests.handler'
import { ListRequestQueueHandler } from '../../application/request/queries/list-request-queue/list-request-queue.handler'
import { RequestController } from './request.controller'
import { AssigneeResolver } from '../../application/request/services/assignee-resolver'
import { PrismaAssigneeDirectory } from '../../infrastructure/request/prisma-assignee-directory'
import { SlaMonitorService } from '../../application/observability/services/sla-monitor.service'
import { SlaMonitorScheduler } from '../../infrastructure/observability/sla-monitor.scheduler'
import { PrismaSlaScan } from '../../infrastructure/observability/prisma-sla-scan'

const handlers = [
  SubmitRequestHandler,
  ClassifyRequestByModelHandler,
  ClassifyRequestByHumanHandler,
  StartRequestWorkflowHandler,
  AssignStepHandler,
  ActOnStepHandler,
  UploadDocumentHandler,
  GetRequestHandler,
  GetRequestByReferenceHandler,
  ListMyRequestsHandler,
  ListAssignedRequestsHandler,
  ListRequestQueueHandler,
]

/**
 * Request runtime composition root. Binds the request-side ports -- the request
 * aggregate, its audit-action log, payments, documents, the workflow path it
 * routes onto, id generation, and object storage -- then registers the command
 * and query handlers that run a request through its lifecycle over HTTP.
 *
 * The SLA monitor is registered here rather than in ObservabilityModule on
 * purpose: it has to load and save request aggregates, and REQUEST_REPOSITORY
 * is bound in this module. Since RequestModule already imports
 * ObservabilityModule, registering it the other way round would create a
 * circular import. Keeping it here leaves the dependency arrow pointing one
 * way, and it still reaches ML_PREDICTION_REPOSITORY,
 * SYSTEM_SETTING_REPOSITORY and BusinessHoursService through
 * ObservabilityModule's exports.
 */
@Module({
  imports: [CqrsModule, CatalogModule, ObservabilityModule],
  controllers: [RequestController],
  providers: [
    ...handlers,
    { provide: REQUEST_REPOSITORY, useClass: PrismaRequestRepository },
    {
      provide: REQUEST_ACTION_REPOSITORY,
      useClass: PrismaRequestActionRepository,
    },
    { provide: PAYMENT_REPOSITORY, useClass: PrismaPaymentRepository },
    { provide: DOCUMENT_REPOSITORY, useClass: PrismaDocumentRepository },
    {
      provide: WORKFLOW_PATH_REPOSITORY,
      useClass: PrismaWorkflowPathRepository,
    },
    { provide: ID_GENERATOR, useClass: UuidV7IdGenerator },
    {
      provide: REFERENCE_NUMBER_GENERATOR,
      useClass: PrismaReferenceNumberGenerator,
    },
    { provide: OBJECT_STORAGE, useClass: MinioObjectStorage },
    { provide: ASSIGNEE_DIRECTORY, useClass: PrismaAssigneeDirectory },
    { provide: SLA_SCAN, useClass: PrismaSlaScan },
    AssigneeResolver,
    SlaMonitorService,
    SlaMonitorScheduler,
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
