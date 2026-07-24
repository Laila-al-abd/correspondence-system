import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { RequestStepInstance } from '../../../../domain/request/request-step-instance'
import { Identifier } from '../../../../domain/shared/identifier'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import {
  ID_GENERATOR,
  REQUEST_REPOSITORY,
  WORKFLOW_PATH_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { StartRequestWorkflowCommand } from './start-request-workflow.command'

const MS_PER_HOUR = 60 * 60 * 1000

export interface StartWorkflowResult {
  id: string
  workflowPathId: string
  stepCount: number
}

/**
 * Routes a classified request onto its template's active workflow path. Every
 * workflow step becomes a runtime step instance with its own SLA clock, and the
 * request moves to IN_PROGRESS. The aggregate rejects this if the request was
 * never classified.
 */
@CommandHandler(StartRequestWorkflowCommand)
export class StartRequestWorkflowHandler
  implements ICommandHandler<StartRequestWorkflowCommand, StartWorkflowResult>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(WORKFLOW_PATH_REPOSITORY)
    private readonly workflowPaths: WorkflowPathRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async execute(
    command: StartRequestWorkflowCommand,
  ): Promise<StartWorkflowResult> {
    const request = await this.requests.findById(
      Identifier.of(command.requestId),
    )
    if (!request) throw new EntityNotFoundError('Request', command.requestId)

    const templateId = request.templateId
    if (!templateId)
      throw new InvariantViolationError(
        'Cannot start a workflow before the request is classified.',
      )

    const path = await this.workflowPaths.findActiveByTemplate(templateId)
    if (!path)
      throw new EntityNotFoundError(
        'Active workflow path for template',
        templateId.toString(),
      )

    const now = Date.now()
    const stepInstances = path.steps.map((step) =>
      RequestStepInstance.create(this.ids.next(), {
        requestId: request.id,
        workflowStepId: step.id,
        slaDueAt:
          step.slaHours !== undefined
            ? new Date(now + step.slaHours * MS_PER_HOUR)
            : undefined,
      }),
    )

    request.startWorkflow(path.id, stepInstances)
    await this.requests.save(request)
    return {
      id: request.id.toString(),
      workflowPathId: path.id.toString(),
      stepCount: stepInstances.length,
    }
  }
}
