import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { Guard } from "../shared/guard"
import { ModelType } from "./enums"

interface MlPredictionProps {
  requestId: Identifier
  modelType: ModelType
  /**
   * Which template field this prediction is about. Undefined for predictions
   * about the whole request (classification, SLA risk); set for extraction,
   * which is right or wrong one field at a time and can only be measured that
   * way.
   */
  fieldKey?: string
  modelVersion: string
  predictedValue: unknown
  confidence?: number
  createdAt: Date
}

/**
 * One recorded inference: what the classifier chose, what the extractor found,
 * or what the SLA rule decided. Retained for auditing, KPI dashboards, and
 * model monitoring.
 *
 * Only judgements made *at a moment* belong here -- things that cannot be
 * recomputed afterwards, because the input text, the threshold, or the calendar
 * they depended on may have moved since. Figures derived from the current
 * contents of the database, such as the typical duration of a template, are
 * queries and are not stored: a row per read would say nothing an aggregate over
 * `requests` does not already say, and would misrepresent arithmetic as
 * inference.
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
      fieldKey?: string
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

  snapshot(): {
    requestId: string
    modelType: ModelType
    fieldKey?: string
    modelVersion: string
    predictedValue: unknown
    confidence?: number
    createdAt: Date
  } {
    return {
      requestId: this.props.requestId.toString(),
      modelType: this.props.modelType,
      fieldKey: this.props.fieldKey,
      modelVersion: this.props.modelVersion,
      predictedValue: this.props.predictedValue,
      confidence: this.props.confidence,
      createdAt: this.props.createdAt,
    }
  }

  /** For NLP classifications: is the model confident enough to auto-accept? */
  isConfident(threshold = 0.8): boolean {
    return this.props.confidence !== undefined && this.props.confidence >= threshold
  }

  get modelType(): ModelType { return this.props.modelType }
  get fieldKey(): string | undefined { return this.props.fieldKey }
  get predictedValue(): unknown { return this.props.predictedValue }
  get confidence(): number | undefined { return this.props.confidence }
}
