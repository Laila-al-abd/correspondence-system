import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import {
  ID_GENERATOR,
  TEMPLATE_REPOSITORY,
  WORKFLOW_PATH_REPOSITORY,
} from '../../application/tokens'
import { PrismaWorkflowPathRepository } from '../../infrastructure/workflow/prisma-workflow-path.repository'
import { PrismaTemplateRepository } from '../../infrastructure/catalog/prisma-template.repository'
import { UuidV7IdGenerator } from '../../infrastructure/shared/uuid-v7-id.generator'
import { DefineWorkflowPathHandler } from '../../application/workflow/commands/define-workflow-path/define-workflow-path.handler'
import { ActivateWorkflowPathHandler } from '../../application/workflow/commands/activate-workflow-path/activate-workflow-path.handler'
import { DeactivateWorkflowPathHandler } from '../../application/workflow/commands/deactivate-workflow-path/deactivate-workflow-path.handler'
import { GetWorkflowPathHandler } from '../../application/workflow/queries/get-workflow-path/get-workflow-path.handler'
import { ListWorkflowPathsByTemplateHandler } from '../../application/workflow/queries/list-workflow-paths/list-workflow-paths.handler'
import { WorkflowController } from './workflow.controller'
// Authoring validates the action types a step offers, so it needs the catalogue
// port. CatalogModule exports ACTION_TYPE_REPOSITORY and does not import this
// module, so there is no cycle.
import { CatalogModule } from '../catalog/catalog.module'

const handlers = [
  DefineWorkflowPathHandler,
  ActivateWorkflowPathHandler,
  DeactivateWorkflowPathHandler,
  GetWorkflowPathHandler,
  ListWorkflowPathsByTemplateHandler,
]

/**
 * Workflow composition root. Binds the workflow-path port (plus the template
 * lookup and id generation the authoring use-cases need) to their adapters,
 * registers the command/query handlers, and exposes them over HTTP. The path
 * port is exported so the Request context can route requests onto active paths.
 */
@Module({
  imports: [CqrsModule, CatalogModule],
  controllers: [WorkflowController],
  providers: [
    ...handlers,
    {
      provide: WORKFLOW_PATH_REPOSITORY,
      useClass: PrismaWorkflowPathRepository,
    },
    { provide: TEMPLATE_REPOSITORY, useClass: PrismaTemplateRepository },
    { provide: ID_GENERATOR, useClass: UuidV7IdGenerator },
  ],
  exports: [WORKFLOW_PATH_REPOSITORY],
})
export class WorkflowModule {}
