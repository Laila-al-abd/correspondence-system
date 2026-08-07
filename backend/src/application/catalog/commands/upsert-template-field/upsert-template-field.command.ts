import type { TemplateFieldInput } from '../template-field.factory'

export interface UpsertTemplateFieldInput {
  templateId: string
  field: TemplateFieldInput
  /** Where in the form it sits. Defaults to its current place, or last. */
  ordinal?: number
}

export class UpsertTemplateFieldCommand {
  constructor(public readonly input: UpsertTemplateFieldInput) {}
}
