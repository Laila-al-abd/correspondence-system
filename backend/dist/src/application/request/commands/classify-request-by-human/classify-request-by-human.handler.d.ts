import { ICommandHandler } from '@nestjs/cqrs';
import type { RequestRepository } from '../../../../domain/request/ports/request.repository';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import { TemplateSubmissionPolicy } from '../../services/template-submission-policy';
import { NotificationEmitter } from '../../../observability/services/notification-emitter';
import { EventRecorder } from '../../../observability/services/event-recorder';
import { ClassifyRequestByHumanCommand } from './classify-request-by-human.command';
export interface HumanClassificationResult {
    id: string;
    classificationStatus: string;
    fieldsWritten: number;
}
export declare class ClassifyRequestByHumanHandler implements ICommandHandler<ClassifyRequestByHumanCommand, HumanClassificationResult> {
    private readonly requests;
    private readonly templates;
    private readonly submissionPolicy;
    private readonly notifier;
    private readonly events;
    constructor(requests: RequestRepository, templates: TemplateRepository, submissionPolicy: TemplateSubmissionPolicy, notifier: NotificationEmitter, events: EventRecorder);
    execute({ input, }: ClassifyRequestByHumanCommand): Promise<HumanClassificationResult>;
}
