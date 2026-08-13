"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluateEligibility = void 0;
class EvaluateEligibility {
    userAttributes;
    attributeDefinitions;
    constructor(userAttributes, attributeDefinitions) {
        this.userAttributes = userAttributes;
        this.attributeDefinitions = attributeDefinitions;
    }
    async resolveAttributes(userId) {
        const held = await this.userAttributes.listForUser(userId);
        return new Map(held.map((attribute) => [
            attribute.attributeId.toString(),
            attribute.value,
        ]));
    }
    async attributeCodeMap() {
        const definitions = await this.attributeDefinitions.list();
        return new Map(definitions.map((def) => [def.id.toString(), def.code]));
    }
    async evaluate(userId, template) {
        const attributes = await this.resolveAttributes(userId);
        return this.evaluateWith(userId, template, attributes);
    }
    async evaluateWith(userId, template, attributes, codeByAttributeId) {
        const codes = codeByAttributeId ?? (await this.attributeCodeMap());
        const unmetRules = template
            .unmetEligibilityRules(attributes)
            .map((rule) => ({
            attributeId: rule.attributeId,
            attributeCode: codes.get(rule.attributeId),
            operator: rule.operator,
            value: rule.value,
        }));
        return {
            userId: userId.toString(),
            templateId: template.id.toString(),
            eligible: unmetRules.length === 0,
            unmetRules,
        };
    }
}
exports.EvaluateEligibility = EvaluateEligibility;
//# sourceMappingURL=evaluate-eligibility.js.map