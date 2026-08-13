import { CommandBus, ICommandHandler } from '@nestjs/cqrs';
import type { RequestRepository } from '../../../../domain/request/ports/request.repository';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import { NotificationEmitter } from '../../../observability/services/notification-emitter';
import { EventRecorder } from '../../../observability/services/event-recorder';
import { ConfirmOutcome, ConfirmRequestCommand } from './confirm-request.command';
export interface ConfirmationResult {
    id: string;
    outcome: ConfirmOutcome;
    classificationStatus: string;
    confirmedAt?: string;
}
export declare class ConfirmRequestHandler implements ICommandHandler<ConfirmRequestCommand, ConfirmationResult> {
    private readonly requests;
    private readonly templates;
    private readonly notifier;
    private readonly events;
    private readonly commandBus;
    private readonly logger;
    constructor(requests: RequestRepository, templates: TemplateRepository, notifier: NotificationEmitter, events: EventRecorder, commandBus: CommandBus);
    execute({ input }: ConfirmRequestCommand): Promise<ConfirmationResult>;
}
