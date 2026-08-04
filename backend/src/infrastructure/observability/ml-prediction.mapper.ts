import {
  Prisma,
  MlPrediction as MlPredictionRow,
} from '../../../generated/prisma/client'
import { MlPrediction } from '../../domain/observability/ml-prediction'
import { ModelType } from '../../domain/observability/enums'
import { Identifier } from '../../domain/shared/identifier'

/** Maps between the MlPrediction entity and the `ml_predictions` row. */
export const MlPredictionMapper = {
  toDomain(row: MlPredictionRow): MlPrediction {
    return MlPrediction.rehydrate(Identifier.of(row.id), {
      requestId: Identifier.of(row.requestId),
      modelType: row.modelType as ModelType,
      fieldKey: row.fieldKey ?? undefined,
      modelVersion: row.modelVersion,
      predictedValue: row.predictedValue,
      confidence:
        row.confidence != null ? row.confidence.toNumber() : undefined,
      createdAt: row.createdAt,
    })
  },

  toPersistence(
    prediction: MlPrediction,
  ): Prisma.MlPredictionUncheckedCreateInput {
    const s = prediction.snapshot()
    return {
      id: prediction.id.toString(),
      requestId: s.requestId,
      modelType: s.modelType,
      fieldKey: s.fieldKey ?? null,
      modelVersion: s.modelVersion,
      // An abstention is a row with no predicted value, and it has to be
      // stored as SQL json null rather than dropped: "the model was asked and
      // declined" and "the model was never asked" are different measurements,
      // and only the first one belongs in the abstention rate.
      predictedValue:
        s.predictedValue === null || s.predictedValue === undefined
          ? Prisma.JsonNull
          : (s.predictedValue as Prisma.InputJsonValue),
      confidence: s.confidence ?? null,
      createdAt: s.createdAt,
    }
  },
}
