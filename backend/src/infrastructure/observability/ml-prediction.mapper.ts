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
      id: BigInt(prediction.id.toString()),
      requestId: BigInt(s.requestId),
      modelType: s.modelType,
      modelVersion: s.modelVersion,
      predictedValue: s.predictedValue as Prisma.InputJsonValue,
      confidence: s.confidence ?? null,
      createdAt: s.createdAt,
    }
  },
}
