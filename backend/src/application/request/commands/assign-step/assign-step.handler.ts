import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Identifier } from '../../../../domain/shared/identifier'
import type { Request } from '../../../../domain/request/request'
import type { RequestStepInstance } from '../../../../domain/request/request-step-instance'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository'
import type { AssigneeDirectoryPort } from '../../ports/assignee-directory.port'
import { AssigneeResolver } from '../../services/assignee-resolver'
import {
  ASSIGNEE_DIRECTORY,
  REQUEST_REPOSITORY,
  WORKFLOW_PATH_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError, ForbiddenActionError } from '../../../errors'
import { NotificationEmitter } from '../../../observability/services/notification-emitter'
import { EventRecorder } from '../../../observability/services/event-recorder'
import { AssignStepCommand } from './assign-step.command'

export interface AssignStepResult {
  stepInstanceId: string
  assignedToUserId: string
}

/**
 * Assigns a handler (user) to one runtime step. Routing and doing the work are
 * separate concerns: a step must be assigned before it can be started.
 *
 * Manual assignment is vetted against the same rules automatic routing obeys.
 * Holding request.act is permission to reassign work, not permission to hand a
 * step to anybody at all: without this check an admin could assign an approval
 * step to the applicant who raised the request and quietly undo the
 * no-self-approval rule the resolver works hard to enforce.
 */
@CommandHandler(AssignStepCommand)
export class AssignStepHandler
  implements ICommandHandler<AssignStepCommand, AssignStepResult>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(WORKFLOW_PATH_REPOSITORY)
    private readonly workflowPaths: WorkflowPathRepository,
    @Inject(ASSIGNEE_DIRECTORY)
    private readonly directory: AssigneeDirectoryPort,
    private readonly assignees: AssigneeResolver,
    private readonly notifier: NotificationEmitter,
    private readonly events: EventRecorder,
  ) {}

  async execute({ input }: AssignStepCommand): Promise<AssignStepResult> {
    const request = await this.requests.findById(Identifier.of(input.requestId))
    if (!request) throw new EntityNotFoundError('Request', input.requestId)

    const step = request.stepInstances.find(
      (si) => si.id.toString() === input.stepInstanceId,
    )
    if (!step)
      throw new EntityNotFoundError('Step instance', input.stepInstanceId)

    await this.assertAssignable(request, step, input.assigneeUserId)

    step.assignTo(Identifier.of(input.assigneeUserId))
    await this.requests.save(request)

    // The actor is whoever reassigned it, taken from the token; who it went to
    // is on the step instance this event points at.
    await this.events.assigned({
      requestId: request.id.toString(),
      stepInstanceId: step.id.toString(),
    })

    await this.notifier.stepAssigned({
      assigneeUserId: input.assigneeUserId,
      requestId: request.id.toString(),
      referenceNo: request.referenceNo,
    })

    return {
      stepInstanceId: step.id.toString(),
      assignedToUserId: input.assigneeUserId,
    }
  }

  /**
   * Three checks, cheapest first: never the requester, never an inactive user,
   * and -- when the step's definition can be resolved -- somebody the step's
   * assignee strategy actually allows.
   */
  private async assertAssignable(
    request: Request,
    step: RequestStepInstance,
    assigneeUserId: string,
  ): Promise<void> {
    if (assigneeUserId === request.requesterId.toString())
      throw new ForbiddenActionError(
        'A request cannot be assigned to the person who raised it.',
      )

    if (!(await this.directory.isAssignable(assigneeUserId)))
      throw new ForbiddenActionError(
        'That user is not an active member of staff and cannot be given work.',
      )

    const pathId = request.workflowPathId
    if (!pathId) return

    const path = await this.workflowPaths.findById(pathId)
    const workflowStepId = step.snapshot().workflowStepId
    const definition = path?.steps.find(
      (candidate) => candidate.id.toString() === workflowStepId,
    )
    if (!definition) return

    const { recommended, wider } = await this.assignees.assignableUsersForStep(
      definition,
      request.requesterId,
    )
    // An empty pool means the step is unroutable (a vacant role, say). Blocking
    // manual assignment there would leave the request permanently stuck, which
    // is precisely the situation manual assignment exists to rescue.
    const eligible = [...recommended, ...wider]
    if (eligible.length === 0) return

    // Deliberately wider than automatic routing: department scope is guidance
    // for the router, not a permission boundary. Holding the step's role is the
    // permission boundary, and it is still enforced here.
    if (!eligible.some((candidate) => candidate.userId === assigneeUserId))
      throw new ForbiddenActionError(
        'That user does not hold the role this step requires. Assign it to ' +
          'someone eligible for the step, or change the step definition.',
      )
  }
}
