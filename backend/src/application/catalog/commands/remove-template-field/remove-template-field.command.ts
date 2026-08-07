export interface RemoveTemplateFieldInput {
  templateId: string
  fieldKey: string
}

export class RemoveTemplateFieldCommand {
  constructor(public readonly input: RemoveTemplateFieldInput) {}
}
