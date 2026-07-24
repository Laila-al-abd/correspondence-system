import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { WORKFLOW_PATH_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { ActivateWorkflowPathCommand } from './activate-workflow-path.command'

export interface WorkflowPathStateResult {
  id: string
  isActive: boolean
}

/**
 * Activates a workflow path after validating its graph (acyclic, every
 * dependency resolvable, at least one entry step). Any other active path for the
 * same template is deactivated so a template always has exactly one active path.
 */
@CommandHandler(ActivateWorkflowPathCommand)
export class ActivateWorkflowPathHandler
  implements
    ICommandHandler<ActivateWorkflowPathCommand, WorkflowPathStateResult>
{
  constructor(
    @Inject(WORKFLOW_PATH_REPOSITORY)
    private readonly workflowPaths: WorkflowPathRepository,
  ) {}

  async execute({
    workflowPathId,
  }: ActivateWorkflowPathCommand): Promise<WorkflowPathStateResult> {
    const path = await this.workflowPaths.findById(
      Identifier.of(workflowPathId),
    )
    if (!path) throw new EntityNotFoundError('WorkflowPath', workflowPathId)

    path.activate()

    const current = await this.workflowPaths.findActiveByTemplate(
      path.templateId,
    )
    if (current && !current.id.equals(path.id)) {
      current.deactivate()
      await this.workflowPaths.save(current)
    }

    await this.workflowPaths.save(path)
    return { id: path.id.toString(), isActive: path.isActive }
  }
}
