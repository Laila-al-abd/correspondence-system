export interface ClassifyRequestByModelInput {
  requestId: string
  templateId: string
  confidence: number
  threshold?: number
  /**
   * Which build of the model produced this answer. Optional so existing callers
   * keep working, but every real caller should send it: without it the stored
   * predictions cannot be grouped by model build, and "did the new model do
   * better than the old one?" becomes unanswerable.
   */
  modelVersion?: string
}

export class ClassifyRequestByModelCommand {
  constructor(public readonly input: ClassifyRequestByModelInput) {}
}
