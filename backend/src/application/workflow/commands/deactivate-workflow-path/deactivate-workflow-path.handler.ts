import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { WORKFLOW_PATH_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { WorkflowPathStateResult } from '../activate-workflow-path/activate-workflow-path.handler'
import { DeactivateWorkflowPathCommand } from './deactivate-workflow-path.command'

/** Deactivates a workflow path so it no longer routes new requests. */
@CommandHandler(DeactivateWorkflowPathCommand)
export class DeactivateWorkflowPathHandler
  implements
    ICommandHandler<DeactivateWorkflowPathCommand, WorkflowPathStateResult>
{
  constructor(
    @Inject(WORKFLOW_PATH_REPOSITORY)
    private readonly workflowPaths: WorkflowPathRepository,
  ) {}

  async execute({
    workflowPathId,
  }: DeactivateWorkflowPathCommand): Promise<WorkflowPathStateResult> {
    const path = await this.workflowPaths.findById(
      Identifier.of(workflowPathId),
    )
    if (!path) throw new EntityNotFoundError('WorkflowPath', workflowPathId)
    path.deactivate()
    await this.workflowPaths.save(path)
    return { id: path.id.toString(), isActive: path.isActive }
  }
}
