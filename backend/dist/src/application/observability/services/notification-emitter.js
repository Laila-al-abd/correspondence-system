"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationEmitter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEmitter = void 0;
const common_1 = require("@nestjs/common");
const notification_1 = require("../../../domain/observability/notification");
const identifier_1 = require("../../../domain/shared/identifier");
const tokens_1 = require("../../tokens");
const notification_types_1 = require("../notification-types");
const REVIEWER_PERMISSION = 'request.classify';
const REVIEWER_FALLBACK_PERMISSION = 'user.manage';
const WORKFLOW_ADMIN_PERMISSION = 'workflow.manage';
let NotificationEmitter = NotificationEmitter_1 = class NotificationEmitter {
    notifications;
    ids;
    audience;
    stream;
    logger = new common_1.Logger(NotificationEmitter_1.name);
    constructor(notifications, ids, audience, stream) {
        this.notifications = notifications;
        this.ids = ids;
        this.audience = audience;
        this.stream = stream;
    }
    async stepAssigned(input) {
        await this.push({
            userId: input.assigneeUserId,
            actorId: input.actorId,
            type: notification_types_1.NotificationType.STEP_ASSIGNED,
            title: 'A request step is waiting for you',
            body: `Request ${label(input.referenceNo, input.requestId)} has a step assigned to you.`,
            requestId: input.requestId,
        });
    }
    async paymentRequested(input) {
        await this.push({
            userId: input.userId,
            actorId: input.actorId,
            type: notification_types_1.NotificationType.PAYMENT_REQUESTED,
            title: 'A payment is requested',
            body: `Request ${label(input.referenceNo, input.requestId)} has a payment requested, go to payment office.`,
            requestId: input.requestId,
        });
    }
    async requestStateChanged(input) {
        await this.push({
            userId: input.userId,
            actorId: input.actorId,
            type: notification_types_1.NotificationType.REQUEST_STATE_CHANGED,
            title: `Your request is now ${humanize(input.status)}`,
            body: `Request ${label(input.referenceNo, input.requestId)} moved to ${humanize(input.status)}.`,
            requestId: input.requestId,
        });
    }
    async actionTaken(input) {
        await this.push({
            userId: input.userId,
            actorId: input.actorId,
            type: notification_types_1.NotificationType.ACTION_TAKEN,
            title: `New activity on your request`,
            body: `A "${humanize(input.action)}" action was recorded on request ${label(input.referenceNo, input.requestId)}.`,
            requestId: input.requestId,
        });
    }
    async classificationNeedsReview(input) {
        let reviewerIds = [];
        try {
            reviewerIds = await this.audience.findUserIdsWithPermission(REVIEWER_PERMISSION);
            if (reviewerIds.length === 0) {
                this.logger.warn(`Nobody holds ${REVIEWER_PERMISSION}; falling back to ${REVIEWER_FALLBACK_PERMISSION} for request ${input.requestId}.`);
                reviewerIds = await this.audience.findUserIdsWithPermission(REVIEWER_FALLBACK_PERMISSION);
            }
        }
        catch (error) {
            this.logger.warn(`Could not resolve the review audience: ${describe(error)}`);
            return;
        }
        for (const reviewerId of reviewerIds) {
            await this.push({
                userId: reviewerId,
                type: notification_types_1.NotificationType.CLASSIFICATION_NEEDS_REVIEW,
                title: 'A request needs manual classification',
                body: `Request ${label(input.referenceNo, input.requestId)} could not be classified confidently and is waiting for a human decision.`,
                requestId: input.requestId,
            });
        }
    }
    async stepAssignmentRequired(input) {
        if (input.unassignedStepCount <= 0)
            return;
        let adminIds = [];
        try {
            adminIds = await this.audience.findUserIdsWithPermission(WORKFLOW_ADMIN_PERMISSION);
        }
        catch (error) {
            this.logger.warn(`Could not resolve the workflow-admin audience: ${describe(error)}`);
            return;
        }
        const steps = input.unassignedStepCount === 1
            ? '1 step'
            : `${input.unassignedStepCount} steps`;
        const reason = input.reason ??
            'no active user matched the assignee rule for those steps (role, unit, department head or faculty dean)';
        for (const adminId of adminIds) {
            try {
                const alreadySent = await this.notifications.existsFor(identifier_1.Identifier.of(adminId), identifier_1.Identifier.of(input.requestId), notification_types_1.NotificationType.STEP_ASSIGNMENT_REQUIRED);
                if (alreadySent)
                    continue;
            }
            catch (error) {
                this.logger.warn(`Could not check for a duplicate assignment alert: ${describe(error)}`);
            }
            await this.push({
                userId: adminId,
                type: notification_types_1.NotificationType.STEP_ASSIGNMENT_REQUIRED,
                title: 'A request has steps with no owner',
                body: `Request ${label(input.referenceNo, input.requestId)} started with ${steps} left unassigned because ${reason}. Assign them manually so the request can move.`,
                requestId: input.requestId,
            });
        }
    }
    async confirmationRequired(input) {
        try {
            const alreadySent = await this.notifications.existsFor(identifier_1.Identifier.of(input.requesterId), identifier_1.Identifier.of(input.requestId), notification_types_1.NotificationType.CONFIRMATION_REQUIRED);
            if (alreadySent)
                return;
        }
        catch (error) {
            this.logger.warn(`Could not check for a duplicate confirmation prompt: ${describe(error)}`);
        }
        await this.push({
            userId: input.requesterId,
            type: notification_types_1.NotificationType.CONFIRMATION_REQUIRED,
            title: 'Your request is waiting for you to confirm it',
            body: `Request ${label(input.referenceNo, input.requestId)} has been read and its form filled in as far as it could be. Check the details, complete anything still missing, and confirm so it can start.`,
            requestId: input.requestId,
        });
    }
    async delegationGranted(input) {
        const delegator = input.delegatorName ?? `user ${input.delegatorId}`;
        const delegate = input.delegateName ?? `user ${input.delegateId}`;
        const window = `${input.startDate} to ${input.endDate}`;
        await this.push({
            userId: input.delegateId,
            type: notification_types_1.NotificationType.DELEGATION_GRANTED,
            title: 'You were given delegated authority',
            body: `${delegator} authorized you to act on their behalf from ${window}.`,
        });
        await this.push({
            userId: input.delegatorId,
            type: notification_types_1.NotificationType.DELEGATION_GRANTED,
            title: 'You delegated your authority',
            body: `You authorized ${delegate} to act on your behalf from ${window}.`,
        });
    }
    async delegationRevoked(input) {
        const delegator = input.delegatorName ?? `user ${input.delegatorId}`;
        const delegate = input.delegateName ?? `user ${input.delegateId}`;
        await this.push({
            userId: input.delegateId,
            type: notification_types_1.NotificationType.DELEGATION_REVOKED,
            title: 'Your delegated authority ended',
            body: `You can no longer act on behalf of ${delegator}.`,
        });
        await this.push({
            userId: input.delegatorId,
            type: notification_types_1.NotificationType.DELEGATION_REVOKED,
            title: 'You revoked a delegation',
            body: `${delegate} can no longer act on your behalf.`,
        });
    }
    async push(input) {
        if (!input.userId)
            return;
        if (input.actorId && input.actorId === input.userId)
            return;
        try {
            const notification = notification_1.Notification.create(this.ids.next(), {
                userId: identifier_1.Identifier.of(input.userId),
                type: input.type,
                title: input.title,
                body: input.body,
                requestId: input.requestId
                    ? identifier_1.Identifier.of(input.requestId)
                    : undefined,
            });
            await this.notifications.save(notification);
            const snapshot = notification.snapshot();
            this.stream.publish(input.userId, {
                id: notification.id.toString(),
                type: snapshot.type,
                title: snapshot.title,
                body: snapshot.body ?? null,
                requestId: snapshot.requestId?.toString() ?? null,
                isRead: snapshot.isRead,
                createdAt: snapshot.createdAt.toISOString(),
            });
        }
        catch (error) {
            this.logger.warn(`Could not store a ${input.type} notification for user ${input.userId}: ${describe(error)}`);
        }
    }
};
exports.NotificationEmitter = NotificationEmitter;
exports.NotificationEmitter = NotificationEmitter = NotificationEmitter_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tokens_1.NOTIFICATION_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __param(2, (0, common_1.Inject)(tokens_1.NOTIFICATION_AUDIENCE)),
    __param(3, (0, common_1.Inject)(tokens_1.NOTIFICATION_STREAM)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], NotificationEmitter);
function label(referenceNo, requestId) {
    return referenceNo ?? `#${requestId}`;
}
function humanize(code) {
    return code.toLowerCase().replace(/_/g, ' ');
}
function describe(error) {
    return error instanceof Error ? error.message : String(error);
}
//# sourceMappingURL=notification-emitter.js.map