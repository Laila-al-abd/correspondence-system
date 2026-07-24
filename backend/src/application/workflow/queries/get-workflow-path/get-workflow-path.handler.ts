import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { WORKFLOW_PATH_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { GetWorkflowPathQuery } from './get-workflow-path.query'
import {
  WorkflowPathView,
  toWorkflowPathView,
} from '../views/workflow-path.view'

@QueryHandler(GetWorkflowPathQuery)
export class GetWorkflowPathHandler
  implements IQueryHandler<GetWorkflowPathQuery, WorkflowPathView>
{
  constructor(
    @Inject(WORKFLOW_PATH_REPOSITORY)
    private readonly workflowPaths: WorkflowPathRepository,
  ) {}

  async execute({
    workflowPathId,
  }: GetWorkflowPathQuery): Promise<WorkflowPathView> {
    const path = await this.workflowPaths.findById(
      Identifier.of(workflowPathId),
    )
    if (!path) throw new EntityNotFoundError('WorkflowPath', workflowPathId)
    return toWorkflowPathView(path)
  }
}
