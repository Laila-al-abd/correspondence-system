export interface ClassifyRequestByModelInput {
  requestId: string
  templateId: string
  confidence: number
  threshold?: number
  suggestedPriority?: string
}

export class ClassifyRequestByModelCommand {
  constructor(public readonly input: ClassifyRequestByModelInput) {}
}
