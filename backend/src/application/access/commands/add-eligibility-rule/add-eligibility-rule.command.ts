export interface AddEligibilityRuleInput {
  templateId: string
  attributeCode: string
  operator: string
  value: unknown
}

export class AddEligibilityRuleCommand {
  constructor(public readonly input: AddEligibilityRuleInput) {}
}
