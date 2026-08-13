export interface EligibilityRuleView {
    id: string;
    templateId: string;
    attributeId: string;
    attributeCode: string | null;
    operator: string;
    value: unknown;
}
