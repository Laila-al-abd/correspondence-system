import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { WORKFLOW_PATH_REPOSITORY } from '../../../tokens'
import { ListWorkflowPathsByTemplateQuery } from './list-workflow-paths.query'
import {
  WorkflowPathView,
  toWorkflowPathView,
} from '../views/workflow-path.view'

@QueryHandler(ListWorkflowPathsByTemplateQuery)
export class ListWorkflowPathsByTemplateHandler
  implements
    IQueryHandler<ListWorkflowPathsByTemplateQuery, WorkflowPathView[]>
{
  constructor(
    @Inject(WORKFLOW_PATH_REPOSITORY)
    private readonly workflowPaths: WorkflowPathRepository,
  ) {}

  async execute({
    templateId,
  }: ListWorkflowPathsByTemplateQuery): Promise<WorkflowPathView[]> {
    const paths = await this.workflowPaths.listByTemplate(
      Identifier.of(templateId),
    )
    return paths.map((path) => toWorkflowPathView(path))
  }
}
