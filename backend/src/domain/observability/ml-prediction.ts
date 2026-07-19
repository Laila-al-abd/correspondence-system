import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { Guard } from "../shared/guard"
import { ModelType } from "./enums"

interface MlPredictionProps {
  requestId: Identifier
  modelType: ModelType
  modelVersion: string
  predictedValue: unknown
  confidence?: number
  createdAt: Date
}

/**
 * A stored inference from one of the models (NLP classifier or LSTM
 * remaining-time). Retained for auditing, KPI dashboards, and model monitoring.
 */
export class MlPrediction extends Entity {
  private constructor(id: Identifier, private props: MlPredictionProps) {
    super(id)
  }

  static create(
    id: Identifier,
    p: {
      requestId: Identifier
      modelType: ModelType
      modelVersion: string
      predictedValue: unknown
      confidence?: number
    },
  ): MlPrediction {
    Guard.againstEmpty(p.modelVersion, "modelVersion")
    return new MlPrediction(id, { ...p, createdAt: new Date() })
  }

  static rehydrate(id: Identifier, props: MlPredictionProps): MlPrediction {
    return new MlPrediction(id, props)
  }

  /** For NLP classifications: is the model confident enough to auto-accept? */
  isConfident(threshold = 0.8): boolean {
    return this.props.confidence !== undefined && this.props.confidence >= threshold
  }

  get modelType(): ModelType { return this.props.modelType }
  get predictedValue(): unknown { return this.props.predictedValue }
  get confidence(): number | undefined { return this.props.confidence }
}
