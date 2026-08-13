"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddEligibilityRuleHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const template_eligibility_rule_1 = require("../../../../domain/catalog/template-eligibility-rule");
const enums_1 = require("../../../../domain/catalog/enums");
const domain_error_1 = require("../../../../domain/shared/domain-error");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const add_eligibility_rule_command_1 = require("./add-eligibility-rule.command");
let AddEligibilityRuleHandler = class AddEligibilityRuleHandler {
    templates;
    attributes;
    ids;
    constructor(templates, attributes, ids) {
        this.templates = templates;
        this.attributes = attributes;
        this.ids = ids;
    }
    async execute({ input, }) {
        const template = await this.templates.findById(identifier_1.Identifier.of(input.templateId));
        if (!template)
            throw new errors_1.EntityNotFoundError('Template', input.templateId);
        const definition = await this.attributes.findByCode(input.attributeCode);
        if (!definition)
            throw new errors_1.EntityNotFoundError('Attribute definition', input.attributeCode);
        const operator = input.operator;
        assertValueMatchesOperator(operator, input.value);
        const rule = template_eligibility_rule_1.TemplateEligibilityRule.create(this.ids.next(), {
            attributeId: definition.id,
            operator,
            value: input.value,
        });
        template.addEligibilityRule(rule);
        await this.templates.save(template);
        return {
            id: rule.snapshot().id,
            templateId: input.templateId,
            attributeId: definition.id.toString(),
            attributeCode: definition.code,
            operator,
            value: input.value,
        };
    }
};
exports.AddEligibilityRuleHandler = AddEligibilityRuleHandler;
exports.AddEligibilityRuleHandler = AddEligibilityRuleHandler = __decorate([
    (0, cqrs_1.CommandHandler)(add_eligibility_rule_command_1.AddEligibilityRuleCommand),
    __param(0, (0, common_1.Inject)(tokens_1.TEMPLATE_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.ATTRIBUTE_DEFINITION_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __metadata("design:paramtypes", [Object, Object, Object])
], AddEligibilityRuleHandler);
function assertValueMatchesOperator(operator, value) {
    if (operator === enums_1.RuleOperator.IN) {
        if (!Array.isArray(value))
            throw new domain_error_1.InvariantViolationError('The IN operator requires an array value.');
        return;
    }
    if (operator === enums_1.RuleOperator.GTE || operator === enums_1.RuleOperator.LTE) {
        if (typeof value !== 'number')
            throw new domain_error_1.InvariantViolationError(`The ${operator} operator requires a numeric value.`);
        return;
    }
    if (value === undefined || value === null)
        throw new domain_error_1.InvariantViolationError('A rule value is required.');
}
//# sourceMappingURL=add-eligibility-rule.handler.js.map