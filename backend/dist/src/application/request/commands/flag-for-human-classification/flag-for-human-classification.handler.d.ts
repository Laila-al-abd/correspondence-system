import { ICommandHandler } from '@nestjs/cqrs';
import type { RequestRepository } from '../../../../domain/request/ports/request.repository';
import { NotificationEmitter } from '../../../observability/services/notification-emitter';
import { EventRecorder } from '../../../observability/services/event-recorder';
import { FlagForHumanClassificationCommand } from './flag-for-human-classification.command';
export interface FlagForHumanClassificationResult {
    id: string;
    classificationStatus: string;
}
export declare class FlagForHumanClassificationHandler implements ICommandHandler<FlagForHumanClassificationCommand, FlagForHumanClassificationResult> {
    private readonly requests;
    private readonly notifier;
    private readonly events;
    constructor(requests: RequestRepository, notifier: NotificationEmitter, events: EventRecorder);
    execute({ requestId, }: FlagForHumanClassificationCommand): Promise<FlagForHumanClassificationResult>;
}
