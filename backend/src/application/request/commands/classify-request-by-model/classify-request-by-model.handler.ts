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
import {
  ID_GENERATOR,
  ML_PREDICTION_REPOSITORY,
  REQUEST_REPOSITORY,
  TEMPLATE_REPOSITORY,
  TRANSACTION_RUNNER,
} from '../../../tokens'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import { EntityNotFoundError } from '../../../errors'
import { NotificationEmitter } from '../../../observability/services/notification-emitter'
import { TemplateSubmissionPolicy } from '../../services/template-submission-policy'
import { EventRecorder } from '../../../observability/services/event-recorder'
import { stageOfRequest } from '../../queries/views/request-stage'
import { ClassifyRequestByModelCommand } from './classify-request-by-model.command'

/**
 * Recorded when a caller does not identify its model build. Deliberately a
 * visible placeholder rather than an empty string: it shows up in the data as
 * an obvious omission instead of quietly looking like a real version.
 */
const UNSPECIFIED_MODEL_VERSION = 'unspecified'

export interface ClassificationResult {
  id: string
  classificationStatus: string
}

/**
 * Applies an automatic classification. The model answers one question -- which
 * template -- and below the confidence threshold the request drops to the
 * human-in-the-loop queue instead. Priority is not the model's to give: it
 * comes from the template that was chosen, where an administrator declared it.
 *
 * Every call also leaves a row in `ml_predictions`, whether the answer was
 * trusted or sent to review. That row is what makes the model measurable after
 * the fact: it keeps the model's guess and its confidence frozen at the moment
 * it was made, so when a human later overrides the classification the original
 * prediction is still there to compare against. Without it the request table
 * only ever shows the final answer, and "how often was the model right?" has no
 * data behind it at all.
 */
@CommandHandler(ClassifyRequestByModelCommand)
export class ClassifyRequestByModelHandler
  implements ICommandHandler<ClassifyRequestByModelCommand, ClassificationResult>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(TEMPLATE_REPOSITORY) private readonly templates: TemplateRepository,
    private readonly notifier: NotificationEmitter,
    private readonly submissionPolicy: TemplateSubmissionPolicy,
    @Inject(ML_PREDICTION_REPOSITORY)
    private readonly predictions: MlPredictionRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
    @Inject(TRANSACTION_RUNNER) private readonly transaction: TransactionRunner,
    private readonly events: EventRecorder,
  ) {}

  async execute({
    input,
  }: ClassifyRequestByModelCommand): Promise<ClassificationResult> {
    const request = await this.requests.findById(Identifier.of(input.requestId))
    if (!request) throw new EntityNotFoundError('Request', input.requestId)

    const template = await this.templates.findById(
      Identifier.of(input.templateId),
    )
    if (!template) throw new EntityNotFoundError('Template', input.templateId)

    // Eligibility and form validity are checked here because this is the first
    // moment the template -- and therefore the rules -- are known.
    await this.submissionPolicy.assertMayBeClassifiedAs(request, template)

    const stageBefore = stageOfRequest(request)

    request.classifyByModel(
      Identifier.of(input.templateId),
      input.confidence,
      input.threshold,
      template.defaultPriority,
    )

    // The classification and its audit trail commit together. Separately, one
    // could succeed and the other fail, and a request whose template nobody can
    // account for is worse than a classification that has to be retried.
    await this.transaction.run(async () => {
      await this.requests.save(request)
      await this.predictions.save(
        MlPrediction.create(this.ids.next(), {
          requestId: request.id,
          modelType: ModelType.NLP_CLASSIFIER,
          modelVersion: input.modelVersion ?? UNSPECIFIED_MODEL_VERSION,
          // The chosen template *is* the prediction. Stored as the raw id so a
          // later comparison against the request's final templateId is a
          // straight equality check.
          predictedValue: { templateId: input.templateId },
          confidence: input.confidence,
        }),
      )
      // No actor is passed. The caller here is the AI service account, and
      // reading it from the token is what puts its user id in actor_id -- the
      // whole point of giving the model an account instead of letting its work
      // arrive unattributed.
      await this.events.statusChanged({
        requestId: request.id.toString(),
        from: stageBefore,
        to: stageOfRequest(request),
      })
    })

    // Below the confidence threshold the aggregate parks the request in the
    // human-in-the-loop queue. Nobody owns it yet, so every reviewer is alerted.
    if (request.classificationStatus === ClassificationStatus.HITL) {
      await this.notifier.classificationNeedsReview({
        requestId: request.id.toString(),
        referenceNo: request.referenceNo,
      })
    }

    return {
      id: request.id.toString(),
      classificationStatus: request.classificationStatus,
    }
  }
}
