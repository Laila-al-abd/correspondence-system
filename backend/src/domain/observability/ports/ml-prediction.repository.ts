import { Identifier } from "../../shared/identifier"
import { MlPrediction } from "../ml-prediction"
import { ModelType } from "../enums"

export interface MlPredictionRepository {
  save(prediction: MlPrediction): Promise<void>
  listByRequest(requestId: Identifier): Promise<MlPrediction[]>
  latestFor(requestId: Identifier, modelType: ModelType): Promise<MlPrediction | null>
}
