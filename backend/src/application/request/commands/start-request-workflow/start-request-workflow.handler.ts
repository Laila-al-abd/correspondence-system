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
import { EventRecorder } from '../../../observability/services/event-recorder'
import { stageOfRequest } from '../../queries/views/request-stage'
import { StartRequestWorkflowCommand } from './start-request-workflow.command'
import { AssigneeResolver } from '../../services/assignee-resolver'
import { NotificationEmitter } from '../../../observability/services/notification-emitter'
import { BusinessHoursService } from '../../../observability/services/business-hours.service'

export interface StartWorkflowResult {
  id: string
  workflowPathId: string
  stepCount: number
  assignedStepCount: number
  unassignedStepCount: number
}

/**
 * Routes a classified request onto its template's active workflow path. Every
 * workflow step becomes a runtime step instance, the ones that can begin now
 * start their SLA clock, and the request moves to IN_PROGRESS. The aggregate rejects this if the request was
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
    private readonly assignees: AssigneeResolver,
    private readonly notifier: NotificationEmitter,
    private readonly businessHours: BusinessHoursService,
    private readonly events: EventRecorder,
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

    // SLA clocks run in *working* hours, not wall-clock hours: a 48-hour step
    // started on Thursday afternoon is due two working days later, not on
    // Saturday when nobody is in. The same service backs the working-hours
    // guard and the duration recorded when a request completes, so all three
    // agree on whether a weekend counted.
    const startedAt = new Date()
    // Only the steps that can begin now get a clock. A step waiting behind a
    // dependency is given its deadline when its predecessor finishes -- see
    // RequestStepInstance.scheduleSla, called from ActOnStepHandler. Before
    // this, a path seeded "24h then 48h" gave the second step a deadline 48
    // hours after routing, so the first desk's whole allowance was spent out of
    // the second desk's budget and step two could be reported late before its
    // owner was allowed to touch it.
    const entryStepIds = new Set(path.entrySteps().map((s) => s.id.toString()))
    const stepInstances: RequestStepInstance[] = []
    for (const step of path.steps) {
      const startsNow = entryStepIds.has(step.id.toString())
      const slaDueAt =
        startsNow && step.slaHours !== undefined
          ? await this.businessHours.addWorkingHours(startedAt, step.slaHours)
          : undefined
      stepInstances.push(
        RequestStepInstance.create(this.ids.next(), {
          requestId: request.id,
          workflowStepId: step.id,
          slaDueAt,
        }),
      )
    }

    // Auto-route: pick one owner per step from its assignee strategy. Steps we
    // cannot resolve are left unassigned for an admin to pick up manually.
    const assignments = await this.assignees.resolveForPath(
      path,
      request.requesterId,
    )
    let assignedStepCount = 0
    for (const instance of stepInstances) {
      const assignee = assignments.get(instance.workflowStepId.toString())
      if (assignee) {
        instance.assignTo(assignee)
        assignedStepCount++
      }
    }

    const stageBefore = stageOfRequest(request)
    request.startWorkflow(path.id, stepInstances)
    await this.requests.save(request)

    await this.events.statusChanged({
      requestId: request.id.toString(),
      from: stageBefore,
      to: stageOfRequest(request),
    })
    // Routing is a fact about the file even when nobody chose the owner: the
    // resolver picked it, and this records who was holding the token when that
    // happened. Every step that got an owner is logged, including the ones
    // waiting behind a dependency -- they were routed now, not when they open.
    for (const instance of stepInstances) {
      if (!instance.assignedToUserId) continue
      await this.events.assigned({
        requestId: request.id.toString(),
        stepInstanceId: instance.id.toString(),
      })
    }

    // Everyone who was auto-routed a step hears about it, and the requester is
    // told their request is now moving.
    for (const instance of stepInstances) {
      const assignee = instance.assignedToUserId
      if (!assignee) continue
      // Only the owners of steps that can be worked now are told. Announcing a
      // step whose owner would be refused permission to start it is how a
      // notification list turns into noise nobody reads; the hand-off
      // notification in ActOnStepHandler arrives when it is really their turn.
      if (!entryStepIds.has(instance.workflowStepId.toString())) continue
      await this.notifier.stepAssigned({
        assigneeUserId: assignee.toString(),
        requestId: request.id.toString(),
        referenceNo: request.referenceNo,
      })
    }
    await this.notifier.requestStateChanged({
      userId: request.requesterId.toString(),
      requestId: request.id.toString(),
      referenceNo: request.referenceNo,
      status: request.status,
    })

    // Starting a request never fails just because a step could not be routed,
    // but staying silent was the wrong answer: the request would sit still
    // while looking healthy. Whoever can fix the routing is now told.
    const unassignedStepCount = stepInstances.length - assignedStepCount
    if (unassignedStepCount > 0) {
      await this.notifier.stepAssignmentRequired({
        requestId: request.id.toString(),
        referenceNo: request.referenceNo,
        unassignedStepCount,
      })
    }

    return {
      id: request.id.toString(),
      workflowPathId: path.id.toString(),
      stepCount: stepInstances.length,
      assignedStepCount,
      unassignedStepCount,
    }
  }
}
