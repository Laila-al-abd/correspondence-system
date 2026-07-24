import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { RequestAction } from '../../../../domain/request/request-action'
import { RequestStatus } from '../../../../domain/request/enums'
import { Identifier } from '../../../../domain/shared/identifier'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { RequestActionRepository } from '../../../../domain/request/ports/request-action.repository'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import {
  ID_GENERATOR,
  REQUEST_ACTION_REPOSITORY,
  REQUEST_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { ActOnStepCommand, StepActionKind } from './act-on-step.command'

export interface ActOnStepResult {
  stepInstanceId: string
  stepStatus: string
  requestStatus: string
}

/**
 * The runtime heart: an actor moves one step through its state machine and the
 * decision is recorded in the immutable audit log. Once every step reaches a
 * terminal state the request completes automatically -- the same rule the
 * aggregate enforces in complete(). Request-level reject / hold / cancel remain
 * explicit aggregate operations for later endpoints.
 */
@CommandHandler(ActOnStepCommand)
export class ActOnStepHandler
  implements ICommandHandler<ActOnStepCommand, ActOnStepResult>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(REQUEST_ACTION_REPOSITORY)
    private readonly actions: RequestActionRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async execute({ input }: ActOnStepCommand): Promise<ActOnStepResult> {
    const request = await this.requests.findById(Identifier.of(input.requestId))
    if (!request) throw new EntityNotFoundError('Request', input.requestId)

    const step = request.stepInstances.find(
      (si) => si.id.toString() === input.stepInstanceId,
    )
    if (!step)
      throw new EntityNotFoundError('Step instance', input.stepInstanceId)

    switch (input.action) {
      case StepActionKind.START:
        step.start()
        break
      case StepActionKind.COMPLETE:
        step.complete()
        break
      case StepActionKind.REJECT:
        step.reject()
        break
      case StepActionKind.SKIP:
        step.skip()
        break
      default:
        throw new InvariantViolationError(
          `Unknown step action "${input.action}".`,
        )
    }

    if (input.actionTypeId) {
      const action = RequestAction.create(this.ids.next(), {
        actorId: Identifier.of(input.actorId),
        actionTypeId: Identifier.of(input.actionTypeId),
        requestStepInstanceId: step.id,
        comment: input.comment,
      })
      await this.actions.append(action, request.id)
    }

    if (
      request.status === RequestStatus.IN_PROGRESS &&
      request.stepInstances.every((si) => si.isTerminal())
    ) {
      request.complete()
    }

    await this.requests.save(request)
    return {
      stepInstanceId: step.id.toString(),
      stepStatus: step.status,
      requestStatus: request.status,
    }
  }
}
