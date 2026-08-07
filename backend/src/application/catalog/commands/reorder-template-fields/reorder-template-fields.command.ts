export interface ReorderTemplateFieldsInput {
  templateId: string
  /** Every declared field key, exactly once, in the order to present them. */
  fieldKeys: string[]
}

export class ReorderTemplateFieldsCommand {
  constructor(public readonly input: ReorderTemplateFieldsInput) {}
}
