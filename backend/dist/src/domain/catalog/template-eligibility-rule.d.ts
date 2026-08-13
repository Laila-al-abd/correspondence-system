import { Entity } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { RuleOperator } from "./enums";
interface EligibilityRuleProps {
    attributeId: Identifier;
    operator: RuleOperator;
    value: unknown;
}
export declare class TemplateEligibilityRule extends Entity {
    private props;
    private constructor();
    static create(id: Identifier, p: EligibilityRuleProps): TemplateEligibilityRule;
    static rehydrate(id: Identifier, props: EligibilityRuleProps): TemplateEligibilityRule;
    get attributeId(): Identifier;
    isSatisfiedBy(actual: unknown): boolean;
    snapshot(): {
        id: string;
        attributeId: string;
        operator: RuleOperator;
        value: unknown;
    };
}
export {};
