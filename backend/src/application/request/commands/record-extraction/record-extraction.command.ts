/**
 * Where the extractor found one value in the student's own words.
 *
 * `score` is the model's logit margin, not a probability. It is kept because
 * it is the only number that separates a confident span from a marginal one
 * when the extraction is reviewed afterwards -- but it must never be shown to
 * staff as a percentage, because it is not calibrated and does not mean one.
 */
export interface ExtractionFieldMeta {
  /** The span exactly as it appeared in the request text. */
  raw?: string
  charStart?: number
  charEnd?: number
  score?: number
}

export interface RecordExtractionInput {
  requestId: string
  /** Only the fields the extractor answered. Merged, never replacing. */
  filledData: Record<string, unknown>
  /** Fields the extractor was asked about and declined to answer. */
  abstained?: string[]
  /** Provenance for each answered field, keyed by field key. */
  extractionMeta?: Record<string, ExtractionFieldMeta>
  modelVersion: string
  /** The abstain threshold this run used, recorded so results stay comparable. */
  nullThreshold?: number
}

export class RecordExtractionCommand {
  constructor(public readonly input: RecordExtractionInput) {}
}
