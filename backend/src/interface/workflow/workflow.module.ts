import { Module } from '@nestjs/common'
import { WORKFLOW_PATH_REPOSITORY } from '../../application/tokens'
import { PrismaWorkflowPathRepository } from '../../infrastructure/workflow/prisma-workflow-path.repository'

/**
 * Workflow composition root: binds the WORKFLOW_PATH_REPOSITORY port to its
 * Prisma adapter and exports it so the Request context can consume it later.
 */
@Module({
  providers: [
    { provide: WORKFLOW_PATH_REPOSITORY, useClass: PrismaWorkflowPathRepository },
  ],
  exports: [WORKFLOW_PATH_REPOSITORY],
})
export class WorkflowModule {}
