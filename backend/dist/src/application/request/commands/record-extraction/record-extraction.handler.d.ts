import { ICommandHandler } from '@nestjs/cqrs';
import type { MlPredictionRepository } from '../../../../domain/observability/ports/ml-prediction.repository';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import type { TransactionRunner } from '../../../../domain/shared/transaction-runner';
import type { RequestRepository } from '../../../../domain/request/ports/request.repository';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import type { FilledDataViolation } from '../../../../domain/catalog/template';
import { NotificationEmitter } from '../../../observability/services/notification-emitter';
import { RecordExtractionCommand } from './record-extraction.command';
export interface ExtractionResult {
    id: string;
    filledData: Record<string, unknown>;
    fieldsWritten: number;
    fieldsAbstained: number;
    rejected: FilledDataViolation[];
}
export declare class RecordExtractionHandler implements ICommandHandler<RecordExtractionCommand, ExtractionResult> {
    private readonly requests;
    private readonly templates;
    private readonly predictions;
    private readonly ids;
    private readonly transaction;
    private readonly notifier;
    constructor(requests: RequestRepository, templates: TemplateRepository, predictions: MlPredictionRepository, ids: IdGenerator, transaction: TransactionRunner, notifier: NotificationEmitter);
    execute({ input, }: RecordExtractionCommand): Promise<ExtractionResult>;
}
