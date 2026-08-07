import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { RequestAction } from '../../../../domain/request/request-action'
import { Payment } from '../../../../domain/request/payment'
import { Money } from '../../../../domain/request/value-objects/money'
import { RequestStatus, StepInstanceStatus } from '../../../../domain/request/enums'
import { Identifier } from '../../../../domain/shared/identifier'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { RequestActionRepository } from '../../../../domain/request/ports/request-action.repository'
import type { PaymentRepository } from '../../../../domain/request/ports/payment.repository'
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository'
import type { ActionTypeRepository } from '../../../../domain/catalog/ports/catalog-lookup.repository'
import type { Request } from '../../../../domain/request/request'
import type { RequestStepInstance } from '../../../../domain/request/request-step-instance'
import type { WorkflowStep } from '../../../../domain/workflow/workflow-step'
import type { WorkflowPath } from '../../../../domain/workflow/workflow-path'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import type { TransactionRunner } from '../../../../domain/shared/transaction-runner'
import {
  ACTION_TYPE_REPOSITORY,
  ID_GENERATOR,
  PAYMENT_REPOSITORY,
  REQUEST_ACTION_REPOSITORY,
  REQUEST_REPOSITORY,
  TRANSACTION_RUNNER,
  WORKFLOW_PATH_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError, ForbiddenActionError } from '../../../errors'
import { NotificationEmitter } from '../../../observability/services/notification-emitter'
import { BusinessHoursService } from '../../../observability/services/business-hours.service'
import { EventRecorder } from '../../../observability/services/event-recorder'
import { stageOfRequest } from '../../queries/views/request-stage'
import { ActOnStepCommand, StepActionKind } from './act-on-step.command'

/** The seeded action type a raised fee files itself as. */
const REQUEST_PAYMENT_CODE = 'REQUEST_PAYMENT'

export interface ActOnStepResult {
  stepInstanceId: string
  stepStatus: string
  requestStatus: string
}

/** A step that became startable because the step just acted on finished. */
interface Handoff {
  assigneeUserId: string
}

/**
 * The runtime heart: an actor moves one step through its state machine and the
 * decision is recorded in the immutable audit log. Once every step reaches a
 * terminal state the request completes automatically -- the same rule the
 * aggregate enforces in complete(). Request-level reject / hold / cancel remain
 * explicit aggregate operations for later endpoints.
 *
 * Fees are handled here as well, because a fee is a fact about a step and not
 * about a request: starting a step that declares one raises the payment, and
 * completing that step is refused while the payment is outstanding. Doing it in
 * this one place is what keeps the rule true -- a fee enforced in the controller
 * or in the frontend is a fee that stops existing the moment somebody calls the
 * API directly.
 */
@CommandHandler(ActOnStepCommand)
export class ActOnStepHandler
  implements ICommandHandler<ActOnStepCommand, ActOnStepResult>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(REQUEST_ACTION_REPOSITORY)
    private readonly actions: RequestActionRepository,
    @Inject(PAYMENT_REPOSITORY) private readonly payments: PaymentRepository,
    @Inject(WORKFLOW_PATH_REPOSITORY)
    private readonly workflowPaths: WorkflowPathRepository,
    @Inject(ACTION_TYPE_REPOSITORY)
    private readonly actionTypes: ActionTypeRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactions: TransactionRunner,
    private readonly notifier: NotificationEmitter,
    private readonly businessHours: BusinessHoursService,
    private readonly events: EventRecorder,
  ) {}

  /**
   * The decision is committed first, then people are told about it.
   *
   * Everything that changes the database -- the step transition, the audit
   * action row and the request root -- happens inside one transaction, so a
   * failure halfway through cannot leave an action logged against a step that
   * never moved. Notifications are deliberately sent afterwards: a message
   * cannot be un-sent, so announcing an approval that then rolls back would be
   * worse than announcing it a moment late.
   */
  async execute(command: ActOnStepCommand): Promise<ActOnStepResult> {
    const { input } = command
    const { request, step, statusBefore, handoffs } =
      await this.transactions.run(() => this.applyAction(command))

    // Tell the owner what happened. Notifying is best-effort inside the
    // emitter, so a notification failure can never undo the decision above.
    const requesterId = request.requesterId.toString()
    await this.notifier.actionTaken({
      userId: requesterId,
      actorId: input.actorId,
      requestId: request.id.toString(),
      referenceNo: request.referenceNo,
      action: input.action,
    })
    if (request.status !== statusBefore) {
      await this.notifier.requestStateChanged({
        userId: requesterId,
        actorId: input.actorId,
        requestId: request.id.toString(),
        referenceNo: request.referenceNo,
        status: request.status,
      })
    }

    // The hand-off. Whoever owns a step that just became startable hears about
    // it now, instead of being expected to notice that a request routed to them
    // days ago has finally reached their desk.
    for (const handoff of handoffs) {
      await this.notifier.stepAssigned({
        assigneeUserId: handoff.assigneeUserId,
        actorId: input.actorId,
        requestId: request.id.toString(),
        referenceNo: request.referenceNo,
      })
    }

    return {
      stepInstanceId: step.id.toString(),
      stepStatus: step.status,
      requestStatus: request.status,
    }
  }

  private async applyAction(command: ActOnStepCommand) {
    const { input } = command
    const request = await this.requests.findById(Identifier.of(input.requestId))
    if (!request) throw new EntityNotFoundError('Request', input.requestId)

    const step = request.stepInstances.find(
      (si) => si.id.toString() === input.stepInstanceId,
    )
    if (!step)
      throw new EntityNotFoundError('Step instance', input.stepInstanceId)

    if (step.assignedToUserId?.toString() !== input.actorId)
      throw new ForbiddenActionError(
        'You can only act on steps assigned to you.',
      )

    const statusBefore = request.status
    const stageBefore = stageOfRequest(request)

    // What the workflow definition says about this step -- in particular
    // whether it charges a fee. Absent for a request whose path has since been
    // edited away, in which case there is no fee to enforce.
    const path = await this.loadPath(request)
    const definition = path && this.definitionOf(path, step)

    switch (input.action) {
      case StepActionKind.START:
        // Checked before the transition, so a blocked step stays exactly where
        // it was. Skipped when the path can no longer be loaded: a definition
        // edited away must not strand a request nobody can move.
        if (path) this.assertDependenciesSatisfied(request, step, path)
        step.start()
        // The fee is raised when the work begins, not when the request is
        // submitted: until somebody picks the step up nobody has been asked for
        // anything, and a payment row created earlier would be a bill for work
        // that might yet be rejected.
        if (definition?.fee)
          await this.requestFee(request, step, definition, input.actorId)
        await this.events.stepStarted({
          requestId: request.id.toString(),
          stepInstanceId: step.id.toString(),
          actorId: input.actorId,
        })
        break
      case StepActionKind.COMPLETE:
        // The gate. Checked before the transition so a blocked step stays
        // exactly where it was, and checked against the payment row rather than
        // against anything the caller sent.
        if (definition?.fee) await this.assertFeeSettled(request, step)
        step.complete()
        await this.events.stepCompleted({
          requestId: request.id.toString(),
          stepInstanceId: step.id.toString(),
          actorId: input.actorId,
        })
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

    // A finished step may have been the only thing standing between somebody
    // else and their work. Computed inside the transaction because it writes the
    // successors' deadlines; the notifications it returns are sent after commit.
    const releases =
      path &&
      (input.action === StepActionKind.COMPLETE ||
        input.action === StepActionKind.SKIP)
        ? await this.releaseSuccessors(request, step, path)
        : []

    if (input.actionTypeId) {
      const action = RequestAction.create(this.ids.next(), {
        requestId: request.id,
        actorId: Identifier.of(input.actorId),
        actionTypeId: Identifier.of(input.actionTypeId),
        requestStepInstanceId: step.id,
        comment: input.comment,
      })
      await this.actions.append(action)
      await this.events.actionTaken({
        requestId: request.id.toString(),
        actorId: input.actorId,
        actionTypeId: input.actionTypeId,
        stepInstanceId: step.id.toString(),
      })
    }

    if (
      request.status === RequestStatus.IN_PROGRESS &&
      request.stepInstances.every((si) => si.isTerminal())
    ) {
      request.complete()
      // Measure the finished request once, here, while the policy that defines
      // "a working hour" is the one that was actually in force. A failure to
      // measure must not undo somebody's approval, so this is best-effort: the
      // request completes either way and the column simply stays null.
      const startedAt = request.createdAt
      const finishedAt = request.completedAt
      if (startedAt && finishedAt) {
        try {
          const hours = await this.businessHours.workingHoursBetween(
            startedAt,
            finishedAt,
          )
          request.recordBusinessDuration(hours * 60)
        } catch {
          // Left unmeasured on purpose. An average over the rows that do carry
          // a duration is still honest; a wrong number would not be.
        }
      }
    }

    await this.requests.save(request)

    // Only when the request itself moved -- which here means the last step
    // finished and complete() fired. A step opening or closing is already its
    // own event, and a row saying the stage stayed the same is noise in a table
    // people will read to reconstruct what happened.
    const stageAfter = stageOfRequest(request)
    if (stageAfter !== stageBefore)
      await this.events.statusChanged({
        requestId: request.id.toString(),
        from: stageBefore,
        to: stageAfter,
        actorId: input.actorId,
      })

    return { request, step, statusBefore, handoffs: releases }
  }

  /**
   * The workflow step this instance was created from, or undefined if the path
   * can no longer be loaded. A request instantiates its steps once at start, so
   * this is the only place that still knows what the definition declared.
   */
  private async loadPath(request: Request): Promise<WorkflowPath | undefined> {
    const pathId = request.snapshot().workflowPathId
    if (!pathId) return undefined
    return (
      (await this.workflowPaths.findById(Identifier.of(pathId))) ?? undefined
    )
  }

  /** The definition one runtime step was instantiated from. */
  private definitionOf(
    path: WorkflowPath,
    step: RequestStepInstance,
  ): WorkflowStep | undefined {
    const workflowStepId = step.workflowStepId.toString()
    return path.steps.find((s) => s.id.toString() === workflowStepId)
  }

  /** Workflow step id -> the ids of the steps it waits for. */
  private dependencyMap(path: WorkflowPath): Map<string, string[]> {
    const map = new Map<string, string[]>()
    for (const s of path.steps) map.set(s.id.toString(), s.dependencyIds)
    return map
  }

  /**
   * Refuses to start a step whose prerequisites are unfinished.
   *
   * Request.readySteps has always known how to answer this and nothing ever
   * asked it, which made a declared dependency documentation rather than a
   * rule: step two could be started and completed before step one was opened.
   * Asked only of a PENDING step, so re-starting a running step is not reported
   * as a dependency problem it does not have.
   */
  private assertDependenciesSatisfied(
    request: Request,
    step: RequestStepInstance,
    path: WorkflowPath,
  ): void {
    if (step.status !== StepInstanceStatus.PENDING) return
    const stepId = step.id.toString()
    const ready = request.readySteps(this.dependencyMap(path))
    if (!ready.some((si) => si.id.toString() === stepId))
      throw new ForbiddenActionError(
        'This step cannot start until the steps it depends on are finished.',
      )
  }

  /**
   * Releases the steps that were waiting on the one just finished: each gets an
   * SLA clock starting now, and its owner is handed the file.
   *
   * Only direct successors of this step are considered. A parallel branch that
   * has been startable since the request was routed is already running on its
   * own clock and its owner was told then -- announcing it again here would turn
   * a hand-off into noise. SKIPPED counts as finished, exactly as readySteps
   * counts it, so skipping a step cannot deadlock the ones behind it.
   */
  private async releaseSuccessors(
    request: Request,
    step: RequestStepInstance,
    path: WorkflowPath,
  ): Promise<Handoff[]> {
    const map = this.dependencyMap(path)
    const finished = step.workflowStepId.toString()
    const now = new Date()
    const handoffs: Handoff[] = []

    for (const ready of request.readySteps(map)) {
      const waitedOnThisStep = (
        map.get(ready.workflowStepId.toString()) ?? []
      ).includes(finished)
      if (!waitedOnThisStep) continue

      const definition = this.definitionOf(path, ready)
      if (definition?.slaHours !== undefined)
        ready.scheduleSla(
          await this.businessHours.addWorkingHours(now, definition.slaHours),
        )

      const owner = ready.assignedToUserId
      if (owner) handoffs.push({ assigneeUserId: owner.toString() })
    }
    return handoffs
  }

  /** The payment raised for this step, if one has been raised. */
  private async feeFor(request: Request, step: RequestStepInstance) {
    const stepInstanceId = step.id.toString()
    const payments = await this.payments.listByRequest(request.id)
    return payments.find(
      (p) => p.snapshot().requestStepInstanceId === stepInstanceId,
    )
  }

  /**
   * Raises the fee this step declares, once.
   *
   * Idempotent on purpose: a step may be started, returned and started again,
   * and the requester must not end up owing the fee twice. The amount is copied
   * from the definition at the moment it is charged rather than read live at
   * settlement time, so a later change to the price cannot silently re-bill
   * somebody who has already been told what they owe.
   */
  private async requestFee(
    request: Request,
    step: RequestStepInstance,
    definition: WorkflowStep,
    actorId: string,
  ): Promise<void> {
    const fee = definition.fee
    if (!fee) return
    const existing = await this.feeFor(request, step)
    if (existing) return

    const actor = Identifier.of(actorId)
    const payment = Payment.request(this.ids.next(), {
      requestId: request.id,
      requestStepInstanceId: step.id,
      money: Money.create(fee.amount, fee.currency),
      requestedBy: actor,
    })
    await this.payments.save(payment)

    // Filed in the same trail as every other decision on this request, so the
    // requester can see when they were asked and by whom. Best-effort on the
    // lookup only: a missing seed row must not stop the step from starting.
    const actionType = await this.actionTypes.findByCode(REQUEST_PAYMENT_CODE)
    if (actionType) {
      await this.actions.append(
        RequestAction.create(this.ids.next(), {
          requestId: request.id,
          actorId: actor,
          actionTypeId: actionType.id,
          requestStepInstanceId: step.id,
          comment: `Fee requested: ${fee.amount} ${fee.currency}`,
        }),
      )
    }
  }

  /**
   * Refuses to finish a fee-bearing step while the money is outstanding.
   *
   * WAIVED counts as settled -- the whole point of a waiver is that the request
   * proceeds without payment -- so the question asked here is isSettled() and
   * not "was it paid".
   */
  private async assertFeeSettled(
    request: Request,
    step: RequestStepInstance,
  ): Promise<void> {
    const payment = await this.feeFor(request, step)
    if (!payment)
      throw new ForbiddenActionError(
        "This step charges a fee that has not been raised yet. Start the step first.",
      )
    if (!payment.isSettled())
      throw new ForbiddenActionError(
        "This step cannot be completed until its fee is confirmed or waived.",
      )
  }
}
