import { ICommandHandler } from '@nestjs/cqrs';
import type { MlPredictionRepository } from '../../../../domain/observability/ports/ml-prediction.repository';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import type { TransactionRunner } from '../../../../domain/shared/transaction-runner';
import type { RequestRepository } from '../../../../domain/request/ports/request.repository';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import { NotificationEmitter } from '../../../observability/services/notification-emitter';
import { TemplateSubmissionPolicy } from '../../services/template-submission-policy';
import { EventRecorder } from '../../../observability/services/event-recorder';
import { ClassifyRequestByModelCommand } from './classify-request-by-model.command';
export interface ClassificationResult {
    id: string;
    classificationStatus: string;
}
export declare class ClassifyRequestByModelHandler implements ICommandHandler<ClassifyRequestByModelCommand, ClassificationResult> {
    private readonly requests;
    private readonly templates;
    private readonly notifier;
    private readonly submissionPolicy;
    private readonly predictions;
    private readonly ids;
    private readonly transaction;
    private readonly events;
    constructor(requests: RequestRepository, templates: TemplateRepository, notifier: NotificationEmitter, submissionPolicy: TemplateSubmissionPolicy, predictions: MlPredictionRepository, ids: IdGenerator, transaction: TransactionRunner, events: EventRecorder);
    execute({ input, }: ClassifyRequestByModelCommand): Promise<ClassificationResult>;
}
