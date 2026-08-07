import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Identifier } from '../../../../domain/shared/identifier'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import { REQUEST_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
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
 */
@CommandHandler(AssignStepCommand)
export class AssignStepHandler
  implements ICommandHandler<AssignStepCommand, AssignStepResult>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
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
}
