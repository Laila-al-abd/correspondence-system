export interface ClassifyRequestByHumanInput {
  requestId: string
  templateId: string
  priority?: string
}

export class ClassifyRequestByHumanCommand {
  constructor(public readonly input: ClassifyRequestByHumanInput) {}
}
