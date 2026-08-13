import type { NotificationRepository } from '../../../domain/observability/ports/notification.repository';
import type { IdGenerator } from '../../../domain/shared/id-generator';
import type { NotificationAudiencePort } from '../ports/notification-audience.port';
import type { NotificationStreamPort } from '../ports/notification-stream.port';
export declare class NotificationEmitter {
    private readonly notifications;
    private readonly ids;
    private readonly audience;
    private readonly stream;
    private readonly logger;
    constructor(notifications: NotificationRepository, ids: IdGenerator, audience: NotificationAudiencePort, stream: NotificationStreamPort);
    stepAssigned(input: {
        assigneeUserId: string;
        requestId: string;
        referenceNo?: string;
        actorId?: string;
    }): Promise<void>;
    paymentRequested(input: {
        userId: string;
        actorId: string;
        requestId: string;
        referenceNo?: string;
        amount: number;
        currency: string;
    }): Promise<void>;
    requestStateChanged(input: {
        userId: string;
        requestId: string;
        status: string;
        referenceNo?: string;
        actorId?: string;
    }): Promise<void>;
    actionTaken(input: {
        userId: string;
        requestId: string;
        action: string;
        referenceNo?: string;
        actorId?: string;
    }): Promise<void>;
    classificationNeedsReview(input: {
        requestId: string;
        referenceNo?: string;
    }): Promise<void>;
    stepAssignmentRequired(input: {
        requestId: string;
        unassignedStepCount: number;
        referenceNo?: string;
        reason?: string;
    }): Promise<void>;
    confirmationRequired(input: {
        requesterId: string;
        requestId: string;
        referenceNo?: string;
    }): Promise<void>;
    delegationGranted(input: {
        delegatorId: string;
        delegateId: string;
        startDate: string;
        endDate: string;
        delegatorName?: string;
        delegateName?: string;
    }): Promise<void>;
    delegationRevoked(input: {
        delegatorId: string;
        delegateId: string;
        delegatorName?: string;
        delegateName?: string;
    }): Promise<void>;
    private push;
}
