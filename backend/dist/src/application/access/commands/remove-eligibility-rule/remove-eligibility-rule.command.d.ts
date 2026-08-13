export interface RemoveEligibilityRuleInput {
    templateId: string;
    ruleId: string;
}
export declare class RemoveEligibilityRuleCommand {
    readonly input: RemoveEligibilityRuleInput;
    constructor(input: RemoveEligibilityRuleInput);
}
