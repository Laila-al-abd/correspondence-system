import type { Identifier } from '../../domain/shared/identifier';
import type { Template } from '../../domain/catalog/template';
import type { AttributeDefinitionRepository } from '../../domain/catalog/ports/attribute-definition.repository';
import type { UserAttributeRepository } from '../../domain/identity/ports/user-attribute.repository';
export interface UnmetRuleView {
    attributeId: string;
    attributeCode?: string;
    operator: string;
    value: unknown;
}
export interface TemplateEligibilityView {
    userId: string;
    templateId: string;
    eligible: boolean;
    unmetRules: UnmetRuleView[];
}
export declare class EvaluateEligibility {
    private readonly userAttributes;
    private readonly attributeDefinitions;
    constructor(userAttributes: UserAttributeRepository, attributeDefinitions: AttributeDefinitionRepository);
    resolveAttributes(userId: Identifier): Promise<Map<string, unknown>>;
    attributeCodeMap(): Promise<Map<string, string>>;
    evaluate(userId: Identifier, template: Template): Promise<TemplateEligibilityView>;
    evaluateWith(userId: Identifier, template: Template, attributes: Map<string, unknown>, codeByAttributeId?: Map<string, string>): Promise<TemplateEligibilityView>;
}
