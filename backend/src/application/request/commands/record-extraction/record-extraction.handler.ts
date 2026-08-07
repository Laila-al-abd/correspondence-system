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
import type { FilledDataViolation } from '../../../../domain/catalog/template'
import {
  ID_GENERATOR,
  ML_PREDICTION_REPOSITORY,
  REQUEST_REPOSITORY,
  TEMPLATE_REPOSITORY,
  TRANSACTION_RUNNER,
} from '../../../tokens'
import {
  EntityNotFoundError,
  RequestNotExtractableError,
} from '../../../errors'
import { NotificationEmitter } from '../../../observability/services/notification-emitter'
import { RecordExtractionCommand } from './record-extraction.command'

export interface ExtractionResult {
  id: string
  filledData: Record<string, unknown>
  fieldsWritten: number
  fieldsAbstained: number
  /**
   * Values the extractor sent that this template would not accept. Returned so
   * the AI service can log what was thrown away instead of inferring it from a
   * count that does not add up.
   */
  rejected: FilledDataViolation[]
}

/** Reason recorded for a key this template does not declare. */
const UNKNOWN_FIELD_REASON = 'This field is not part of this template.'

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
    private readonly notifier: NotificationEmitter,
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

    // An undeclared key is dropped and reported, not fatal.
    //
    // It cannot have come from the model. The extractor is only ever asked
    // about keys this template declares, one question per field, so an unknown
    // key is a deployment fact -- the caller is holding a catalogue older than
    // the database, usually because the templates were reseeded after it built
    // its index -- and it says nothing about the values for the fields that do
    // still exist. Refusing the whole payload would throw those good values
    // away and leave the request in the backlog, retried forever against the
    // same stale schema, with the requester waiting on a form that never fills.
    const unknown = new Set(
      template.unknownKeys([...Object.keys(input.filledData), ...abstained]),
    )

    // A bad value on a declared key is not fatal either. The model misread one
    // field: that is a fact about the model, not a reason to discard the eight
    // it read correctly and hand the requester an empty form to rubber-stamp.
    // The value is dropped, recorded as a rejection, and reported back -- and
    // the field arrives at the requester unfilled, which is exactly where a
    // person who knows the answer can supply it.
    //
    // An empty value is not a rejection. A required field the model left blank
    // is an honest abstention, and the completeness check belongs at
    // confirmation, where somebody can actually fill it in.
    const rejected: FilledDataViolation[] = []
    const accepted: Record<string, unknown> = {}
    for (const [fieldKey, value] of Object.entries(input.filledData)) {
      if (unknown.has(fieldKey)) {
        rejected.push({ fieldKey, reason: UNKNOWN_FIELD_REASON })
        continue
      }
      const reason = template.validatePartial({ [fieldKey]: value })[0]?.reason
      if (reason === undefined) accepted[fieldKey] = value
      else rejected.push({ fieldKey, reason })
    }

    // An abstention on a field this template no longer declares is reported the
    // same way, and counted nowhere: it is not a silence about this form.
    const knownAbstained = abstained.filter((fieldKey) => {
      if (!unknown.has(fieldKey)) return true
      rejected.push({ fieldKey, reason: UNKNOWN_FIELD_REASON })
      return false
    })

    request.applyExtractedFields(accepted)

    // Stamped whether or not anything was found, which is the entire point of
    // the column. An empty form after a real attempt and an empty form before
    // one are indistinguishable in filled_data, so a backlog defined by
    // emptiness re-served a request the extractor had already read and found
    // nothing in -- on every poll, forever.
    request.markExtractionAttempted()

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
      for (const [fieldKey, value] of Object.entries(accepted)) {
        await this.predictions.save(
          predictionFor(fieldKey, {
            value,
            ...(meta[fieldKey] ?? {}),
            nullThreshold: input.nullThreshold,
          }),
        )
      }
      // An abstention now carries the threshold that produced it. The same span
      // at the same score is an answer under one threshold and a silence under
      // another, so without it two runs cannot be compared -- which is the only
      // reason these rows are kept.
      for (const fieldKey of knownAbstained) {
        await this.predictions.save(
          predictionFor(fieldKey, {
            value: null,
            nullThreshold: input.nullThreshold,
          }),
        )
      }
      // A rejection keeps the value that was rejected. It is the only row that
      // can answer "what did the model actually say?", and an accuracy figure
      // that counted these as silences would flatter the model in precisely the
      // cases where it was wrong.
      for (const { fieldKey, reason } of rejected) {
        // A key the template does not declare gets no row: there is no field
        // for it to be measured against, and an unattributable measurement is
        // the one thing this table must not be allowed to contain.
        if (unknown.has(fieldKey)) continue
        await this.predictions.save(
          predictionFor(fieldKey, {
            value: input.filledData[fieldKey],
            ...(meta[fieldKey] ?? {}),
            nullThreshold: input.nullThreshold,
            rejectedReason: reason,
          }),
        )
      }
    })

    // Outside the transaction, and after it: the requester is told once the
    // form is as complete as the models can make it, and a notification failure
    // must never roll back an extraction that succeeded.
    await this.notifier.confirmationRequired({
      requesterId: request.requesterId.toString(),
      requestId: request.id.toString(),
      referenceNo: request.referenceNo,
    })

    return {
      id: request.id.toString(),
      filledData: request.filledData ?? {},
      fieldsWritten: Object.keys(accepted).length,
      fieldsAbstained: knownAbstained.length,
      rejected,
    }
  }
}
