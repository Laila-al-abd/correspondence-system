import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ClassificationStatus } from '../../../../domain/request/enums'
import { Identifier } from '../../../../domain/shared/identifier'
import { MlPrediction } from '../../../../domain/observability/ml-prediction'
import { ModelType } from '../../../../domain/observability/enums'
import type { MlPredictionRepository } from '../../../../domain/observability/ports/ml-prediction.repository'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import type { TransactionRunner } from '../../../../domain/shared/transaction-runner'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import {
  ID_GENERATOR,
  ML_PREDICTION_REPOSITORY,
  REQUEST_REPOSITORY,
  TEMPLATE_REPOSITORY,
  TRANSACTION_RUNNER,
} from '../../../tokens'
import {
  EntityNotFoundError,
  FilledDataInvalidError,
  RequestNotExtractableError,
} from '../../../errors'
import { RecordExtractionCommand } from './record-extraction.command'

export interface ExtractionResult {
  id: string
  filledData: Record<string, unknown>
  fieldsWritten: number
  fieldsAbstained: number
}

/**
 * Records one run of the extractor against one request.
 *
 * Two things happen together and must not be able to happen apart. The values
 * land in the request's form data, and every field the model was asked about
 * leaves a row in `ml_predictions` -- including the ones it declined to
 * answer. Without the abstentions the table can only ever report how often the
 * model was right when it spoke, which flatters it: a model that answers two
 * fields out of nine and gets both right is not a 100% model. With them, both
 * the accuracy and the coverage are recoverable from the same rows.
 *
 * The rows carry `score` inside predictedValue rather than in `confidence`.
 * The confidence column is a Decimal(5,4) holding a probability, and the
 * extractor's score is an uncalibrated logit margin that can exceed 1 and go
 * negative. Storing it there would both overflow the column and quietly invite
 * someone to render it as a percentage.
 */
@CommandHandler(RecordExtractionCommand)
export class RecordExtractionHandler
  implements ICommandHandler<RecordExtractionCommand, ExtractionResult>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(TEMPLATE_REPOSITORY) private readonly templates: TemplateRepository,
    @Inject(ML_PREDICTION_REPOSITORY)
    private readonly predictions: MlPredictionRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
    @Inject(TRANSACTION_RUNNER) private readonly transaction: TransactionRunner,
  ) {}

  async execute({
    input,
  }: RecordExtractionCommand): Promise<ExtractionResult> {
    const request = await this.requests.findById(Identifier.of(input.requestId))
    if (!request) throw new EntityNotFoundError('Request', input.requestId)

    // Refused rather than ignored, and with the reason spelled out: the AI
    // service polls, so it will meet a request a reviewer has just taken over,
    // and it needs to tell that apart from a bad request id.
    if (request.classificationStatus === ClassificationStatus.HITL)
      throw new RequestNotExtractableError(
        input.requestId,
        'it is in the human review queue, where a reviewer fills the fields',
      )
    if (request.classificationStatus !== ClassificationStatus.CLASSIFIED)
      throw new RequestNotExtractableError(
        input.requestId,
        'it has not been classified yet',
      )

    const templateId = request.templateId
    if (!templateId)
      throw new RequestNotExtractableError(
        input.requestId,
        'it is classified but carries no template',
      )

    const template = await this.templates.findById(templateId)
    if (!template)
      throw new EntityNotFoundError('Template', templateId.toString())

    const abstained = input.abstained ?? []

    // Both the answered and the abstained keys are checked against the
    // template. An abstention naming a field this template does not have means
    // the caller is working from a stale schema, and silently accepting it
    // would put an unattributable row in the measurement table.
    const violations = [
      ...template.validatePartial(input.filledData),
      ...template.validatePartial(
        Object.fromEntries(abstained.map((key) => [key, undefined])),
      ),
    ]
    if (violations.length > 0) throw new FilledDataInvalidError(violations)

    request.applyExtractedFields(input.filledData)

    const meta = input.extractionMeta ?? {}
    const predictionFor = (
      fieldKey: string,
      predictedValue: unknown,
    ): MlPrediction =>
      MlPrediction.create(this.ids.next(), {
        requestId: request.id,
        modelType: ModelType.NLP_EXTRACTOR,
        fieldKey,
        modelVersion: input.modelVersion,
        predictedValue,
      })

    // The merged form data and its audit rows commit together. Apart, a field
    // could sit in a request with nothing recording which model put it there.
    await this.transaction.run(async () => {
      await this.requests.save(request)
      for (const [fieldKey, value] of Object.entries(input.filledData)) {
        await this.predictions.save(
          predictionFor(fieldKey, {
            value,
            ...(meta[fieldKey] ?? {}),
            nullThreshold: input.nullThreshold,
          }),
        )
      }
      for (const fieldKey of abstained) {
        await this.predictions.save(predictionFor(fieldKey, null))
      }
    })

    return {
      id: request.id.toString(),
      filledData: request.filledData ?? {},
      fieldsWritten: Object.keys(input.filledData).length,
      fieldsAbstained: abstained.length,
    }
  }
}
