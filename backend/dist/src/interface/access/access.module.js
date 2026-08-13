"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const prisma_template_repository_1 = require("../../infrastructure/catalog/prisma-template.repository");
const prisma_attribute_definition_repository_1 = require("../../infrastructure/catalog/prisma-attribute-definition.repository");
const prisma_user_attribute_repository_1 = require("../../infrastructure/identity/prisma-user-attribute.repository");
const evaluate_eligibility_1 = require("../../application/access/evaluate-eligibility");
const check_template_eligibility_handler_1 = require("../../application/access/queries/check-template-eligibility/check-template-eligibility.handler");
const list_eligible_templates_handler_1 = require("../../application/access/queries/list-eligible-templates/list-eligible-templates.handler");
const list_attribute_definitions_handler_1 = require("../../application/access/queries/list-attribute-definitions/list-attribute-definitions.handler");
const add_eligibility_rule_handler_1 = require("../../application/access/commands/add-eligibility-rule/add-eligibility-rule.handler");
const remove_eligibility_rule_handler_1 = require("../../application/access/commands/remove-eligibility-rule/remove-eligibility-rule.handler");
const list_eligibility_rules_handler_1 = require("../../application/access/queries/list-eligibility-rules/list-eligibility-rules.handler");
const uuid_v7_id_generator_1 = require("../../infrastructure/shared/uuid-v7-id.generator");
const tokens_1 = require("../../application/tokens");
const access_controller_1 = require("./access.controller");
const handlers = [
    check_template_eligibility_handler_1.CheckTemplateEligibilityHandler,
    list_eligible_templates_handler_1.ListEligibleTemplatesHandler,
    list_attribute_definitions_handler_1.ListAttributeDefinitionsHandler,
    add_eligibility_rule_handler_1.AddEligibilityRuleHandler,
    remove_eligibility_rule_handler_1.RemoveEligibilityRuleHandler,
    list_eligibility_rules_handler_1.ListEligibilityRulesHandler,
];
let AccessModule = class AccessModule {
};
exports.AccessModule = AccessModule;
exports.AccessModule = AccessModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [access_controller_1.AccessController],
        providers: [
            ...handlers,
            { provide: tokens_1.TEMPLATE_REPOSITORY, useClass: prisma_template_repository_1.PrismaTemplateRepository },
            { provide: tokens_1.ID_GENERATOR, useClass: uuid_v7_id_generator_1.UuidV7IdGenerator },
            {
                provide: tokens_1.ATTRIBUTE_DEFINITION_REPOSITORY,
                useClass: prisma_attribute_definition_repository_1.PrismaAttributeDefinitionRepository,
            },
            {
                provide: tokens_1.USER_ATTRIBUTE_REPOSITORY,
                useClass: prisma_user_attribute_repository_1.PrismaUserAttributeRepository,
            },
            {
                provide: evaluate_eligibility_1.EvaluateEligibility,
                useFactory: (userAttributes, attributeDefinitions) => new evaluate_eligibility_1.EvaluateEligibility(userAttributes, attributeDefinitions),
                inject: [tokens_1.USER_ATTRIBUTE_REPOSITORY, tokens_1.ATTRIBUTE_DEFINITION_REPOSITORY],
            },
        ],
        exports: [evaluate_eligibility_1.EvaluateEligibility],
    })
], AccessModule);
//# sourceMappingURL=access.module.js.map