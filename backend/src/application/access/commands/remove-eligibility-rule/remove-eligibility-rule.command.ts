export interface RemoveEligibilityRuleInput {
  templateId: string
  ruleId: string
}

export class RemoveEligibilityRuleCommand {
  constructor(public readonly input: RemoveEligibilityRuleInput) {}
}
