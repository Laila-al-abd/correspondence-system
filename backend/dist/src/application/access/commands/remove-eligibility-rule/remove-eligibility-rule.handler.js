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
exports.RemoveEligibilityRuleHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const remove_eligibility_rule_command_1 = require("./remove-eligibility-rule.command");
let RemoveEligibilityRuleHandler = class RemoveEligibilityRuleHandler {
    templates;
    constructor(templates) {
        this.templates = templates;
    }
    async execute({ input }) {
        const template = await this.templates.findById(identifier_1.Identifier.of(input.templateId));
        if (!template)
            throw new errors_1.EntityNotFoundError('Template', input.templateId);
        const exists = template
            .snapshot()
            .eligibilityRules.some((rule) => rule.id === input.ruleId);
        if (!exists)
            throw new errors_1.EntityNotFoundError('Eligibility rule', input.ruleId);
        template.removeEligibilityRule(identifier_1.Identifier.of(input.ruleId));
        await this.templates.save(template);
    }
};
exports.RemoveEligibilityRuleHandler = RemoveEligibilityRuleHandler;
exports.RemoveEligibilityRuleHandler = RemoveEligibilityRuleHandler = __decorate([
    (0, cqrs_1.CommandHandler)(remove_eligibility_rule_command_1.RemoveEligibilityRuleCommand),
    __param(0, (0, common_1.Inject)(tokens_1.TEMPLATE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], RemoveEligibilityRuleHandler);
//# sourceMappingURL=remove-eligibility-rule.handler.js.map