import { Inject, Injectable, Logger } from '@nestjs/common'
import { Notification } from '../../../domain/observability/notification'
import type { NotificationRepository } from '../../../domain/observability/ports/notification.repository'
import type { IdGenerator } from '../../../domain/shared/id-generator'
import { Identifier } from '../../../domain/shared/identifier'
import {
  ID_GENERATOR,
  NOTIFICATION_AUDIENCE,
  NOTIFICATION_REPOSITORY,
  NOTIFICATION_STREAM,
} from '../../tokens'
import type { NotificationAudiencePort } from '../ports/notification-audience.port'
import type { NotificationStreamPort } from '../ports/notification-stream.port'
import { NotificationType } from '../notification-types'

/** Permission that identifies the human-in-the-loop classification queue. */
const REVIEWER_PERMISSION = 'request.classify'

/**
 * Who to tell when nobody holds the reviewer permission. An unreviewable
 * request must not disappear silently, so administrators are told instead --
 * they are the people who can grant somebody the missing role.
 */
const REVIEWER_FALLBACK_PERMISSION = 'user.manage'

/** Permission held by the people who can fix an unroutable workflow step. */
const WORKFLOW_ADMIN_PERMISSION = 'workflow.manage'

/**
 * The single place that turns a business event into stored notifications.
 *
 * Two deliberate rules:
 *
 * 1. **Notifying never breaks the operation.** Every write is wrapped, and a
 *    failure is logged instead of thrown. Approving a request must not fail
 *    because the notifications table was unhappy.
 * 2. **Nobody is told about their own action.** Handlers pass `actorId` where
 *    one exists, and the emitter drops the message when the actor is also the
 *    recipient.
 */
@Injectable()
export class NotificationEmitter {
  private readonly logger = new Logger(NotificationEmitter.name)

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notifications: NotificationRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
    @Inject(NOTIFICATION_AUDIENCE)
    private readonly audience: NotificationAudiencePort,
    @Inject(NOTIFICATION_STREAM)
    private readonly stream: NotificationStreamPort,
  ) {}

  /** A workflow step was routed (automatically or manually) to a user. */
  async stepAssigned(input: {
    assigneeUserId: string
    requestId: string
    referenceNo?: string
    actorId?: string
  }): Promise<void> {
    await this.push({
      userId: input.assigneeUserId,
      actorId: input.actorId,
      type: NotificationType.STEP_ASSIGNED,
      title: 'A request step is waiting for you',
      body: `Request ${label(input.referenceNo, input.requestId)} has a step assigned to you.`,
      requestId: input.requestId,
    })
  }

  /** A request changed status; the owner should know. */
  async requestStateChanged(input: {
    userId: string
    requestId: string
    status: string
    referenceNo?: string
    actorId?: string
  }): Promise<void> {
    await this.push({
      userId: input.userId,
      actorId: input.actorId,
      type: NotificationType.REQUEST_STATE_CHANGED,
      title: `Your request is now ${humanize(input.status)}`,
      body: `Request ${label(input.referenceNo, input.requestId)} moved to ${humanize(input.status)}.`,
      requestId: input.requestId,
    })
  }

  /** Somebody took a decision on a step of this request. */
  async actionTaken(input: {
    userId: string
    requestId: string
    action: string
    referenceNo?: string
    actorId?: string
  }): Promise<void> {
    await this.push({
      userId: input.userId,
      actorId: input.actorId,
      type: NotificationType.ACTION_TAKEN,
      title: `New activity on your request`,
      body: `A "${humanize(input.action)}" action was recorded on request ${label(input.referenceNo, input.requestId)}.`,
      requestId: input.requestId,
    })
  }

  /**
   * The classifier fell below its confidence threshold. There is no assignee
   * yet, so everyone who may act on requests is told the queue needs attention.
   */
  async classificationNeedsReview(input: {
    requestId: string
    referenceNo?: string
  }): Promise<void> {
    let reviewerIds: string[] = []
    try {
      reviewerIds = await this.audience.findUserIdsWithPermission(
        REVIEWER_PERMISSION,
      )
      // An empty reviewer pool is a configuration fault, not a reason to drop
      // the request on the floor. Administrators are told instead, because
      // they are the ones who can assign somebody the reviewer role.
      if (reviewerIds.length === 0) {
        this.logger.warn(
          `Nobody holds ${REVIEWER_PERMISSION}; falling back to ${REVIEWER_FALLBACK_PERMISSION} for request ${input.requestId}.`,
        )
        reviewerIds = await this.audience.findUserIdsWithPermission(
          REVIEWER_FALLBACK_PERMISSION,
        )
      }
    } catch (error) {
      this.logger.warn(
        `Could not resolve the review audience: ${describe(error)}`,
      )
      return
    }

    for (const reviewerId of reviewerIds) {
      await this.push({
        userId: reviewerId,
        type: NotificationType.CLASSIFICATION_NEEDS_REVIEW,
        title: 'A request needs manual classification',
        body: `Request ${label(input.referenceNo, input.requestId)} could not be classified confidently and is waiting for a human decision.`,
        requestId: input.requestId,
      })
    }
  }

  /**
   * Auto-routing could not find an owner for one or more steps of a request.
   *
   * Before this existed those steps were left unassigned and nobody was told,
   * so a request could sit still indefinitely while looking perfectly healthy.
   * The people who can actually fix it -- holders of `workflow.manage` -- are
   * now alerted, with the reason included.
   *
   * One notification per request per person, not one per step: the alert is
   * de-duplicated on (user, request, type), so a retry or a second start
   * attempt cannot flood an administrator's inbox with the same problem.
   */
  async stepAssignmentRequired(input: {
    requestId: string
    unassignedStepCount: number
    referenceNo?: string
    reason?: string
  }): Promise<void> {
    if (input.unassignedStepCount <= 0) return

    let adminIds: string[] = []
    try {
      adminIds = await this.audience.findUserIdsWithPermission(
        WORKFLOW_ADMIN_PERMISSION,
      )
    } catch (error) {
      this.logger.warn(
        `Could not resolve the workflow-admin audience: ${describe(error)}`,
      )
      return
    }

    const steps =
      input.unassignedStepCount === 1
        ? '1 step'
        : `${input.unassignedStepCount} steps`
    const reason =
      input.reason ??
      'no active user matched the assignee rule for those steps (role, unit, department head or faculty dean)'

    for (const adminId of adminIds) {
      try {
        const alreadySent = await this.notifications.existsFor(
          Identifier.of(adminId),
          Identifier.of(input.requestId),
          NotificationType.STEP_ASSIGNMENT_REQUIRED,
        )
        if (alreadySent) continue
      } catch (error) {
        // If the duplicate check itself fails, prefer a possible duplicate over
        // a missed alert: a repeated message is an annoyance, a silently
        // stalled request is a failure.
        this.logger.warn(
          `Could not check for a duplicate assignment alert: ${describe(error)}`,
        )
      }

      await this.push({
        userId: adminId,
        type: NotificationType.STEP_ASSIGNMENT_REQUIRED,
        title: 'A request has steps with no owner',
        body: `Request ${label(input.referenceNo, input.requestId)} started with ${steps} left unassigned because ${reason}. Assign them manually so the request can move.`,
        requestId: input.requestId,
      })
    }
  }

  /**
   * A request is waiting for its requester to check what the models made of it.
   *
   * Sent when the extractor's run finishes -- not when the classifier picks a
   * template -- because until then the form is still empty and there would be
   * nothing to look at. Nothing else in the system tells the requester: the
   * request sits in AWAITING_CONFIRMATION, which is a state they can only
   * discover by opening the page and guessing that today is the day.
   *
   * De-duplicated on (user, request, type), so a second extraction run cannot
   * ask the same person twice about the same form.
   */
  async confirmationRequired(input: {
    requesterId: string
    requestId: string
    referenceNo?: string
  }): Promise<void> {
    try {
      const alreadySent = await this.notifications.existsFor(
        Identifier.of(input.requesterId),
        Identifier.of(input.requestId),
        NotificationType.CONFIRMATION_REQUIRED,
      )
      if (alreadySent) return
    } catch (error) {
      // Prefer a repeated prompt to a silent one: a duplicate is an annoyance,
      // an unconfirmed request never starts at all.
      this.logger.warn(
        `Could not check for a duplicate confirmation prompt: ${describe(error)}`,
      )
    }

    await this.push({
      userId: input.requesterId,
      type: NotificationType.CONFIRMATION_REQUIRED,
      title: 'Your request is waiting for you to confirm it',
      body: `Request ${label(input.referenceNo, input.requestId)} has been read and its form filled in as far as it could be. Check the details, complete anything still missing, and confirm so it can start.`,
      requestId: input.requestId,
    })
  }

  /** Delegated authority was granted. Both sides are told. */
  async delegationGranted(input: {
    delegatorId: string
    delegateId: string
    startDate: string
    endDate: string
    delegatorName?: string
    delegateName?: string
  }): Promise<void> {
    const delegator = input.delegatorName ?? `user ${input.delegatorId}`
    const delegate = input.delegateName ?? `user ${input.delegateId}`
    const window = `${input.startDate} to ${input.endDate}`

    await this.push({
      userId: input.delegateId,
      type: NotificationType.DELEGATION_GRANTED,
      title: 'You were given delegated authority',
      body: `${delegator} authorized you to act on their behalf from ${window}.`,
    })
    await this.push({
      userId: input.delegatorId,
      type: NotificationType.DELEGATION_GRANTED,
      title: 'You delegated your authority',
      body: `You authorized ${delegate} to act on your behalf from ${window}.`,
    })
  }

  /** Delegated authority was withdrawn. Both sides are told. */
  async delegationRevoked(input: {
    delegatorId: string
    delegateId: string
    delegatorName?: string
    delegateName?: string
  }): Promise<void> {
    const delegator = input.delegatorName ?? `user ${input.delegatorId}`
    const delegate = input.delegateName ?? `user ${input.delegateId}`

    await this.push({
      userId: input.delegateId,
      type: NotificationType.DELEGATION_REVOKED,
      title: 'Your delegated authority ended',
      body: `You can no longer act on behalf of ${delegator}.`,
    })
    await this.push({
      userId: input.delegatorId,
      type: NotificationType.DELEGATION_REVOKED,
      title: 'You revoked a delegation',
      body: `${delegate} can no longer act on your behalf.`,
    })
  }

  /**
   * Stores one notification. Skips self-notification and swallows failures so a
   * notification problem can never roll back real work.
   */
  private async push(input: {
    userId: string
    type: string
    title: string
    body?: string
    requestId?: string
    actorId?: string
  }): Promise<void> {
    if (!input.userId) return
    if (input.actorId && input.actorId === input.userId) return

    try {
      const notification = Notification.create(this.ids.next(), {
        userId: Identifier.of(input.userId),
        type: input.type,
        title: input.title,
        body: input.body,
        requestId: input.requestId
          ? Identifier.of(input.requestId)
          : undefined,
      })
      await this.notifications.save(notification)

      // Stored first, pushed second, and only ever in that order: the row is
      // the source of truth, so a failed or missed push costs nothing but
      // immediacy. The user still finds the message in their inbox.
      const snapshot = notification.snapshot()
      this.stream.publish(input.userId, {
        id: notification.id.toString(),
        type: snapshot.type,
        title: snapshot.title,
        body: snapshot.body ?? null,
        requestId: snapshot.requestId?.toString() ?? null,
        isRead: snapshot.isRead,
        createdAt: snapshot.createdAt.toISOString(),
      })
    } catch (error) {
      this.logger.warn(
        `Could not store a ${input.type} notification for user ${input.userId}: ${describe(error)}`,
      )
    }
  }
}

/** Prefers the human-friendly reference number, falls back to the raw id. */
function label(referenceNo: string | undefined, requestId: string): string {
  return referenceNo ?? `#${requestId}`
}

/** Turns IN_PROGRESS into "in progress" for message text. */
function humanize(code: string): string {
  return code.toLowerCase().replace(/_/g, ' ')
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
