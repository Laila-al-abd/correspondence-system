export interface AddEligibilityRuleInput {
    templateId: string;
    attributeCode: string;
    operator: string;
    value: unknown;
}
export declare class AddEligibilityRuleCommand {
    readonly input: AddEligibilityRuleInput;
    constructor(input: AddEligibilityRuleInput);
}
