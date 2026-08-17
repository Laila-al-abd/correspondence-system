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
exports.AccessController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const check_template_eligibility_query_1 = require("../../application/access/queries/check-template-eligibility/check-template-eligibility.query");
const list_eligible_templates_query_1 = require("../../application/access/queries/list-eligible-templates/list-eligible-templates.query");
const list_attribute_definitions_query_1 = require("../../application/access/queries/list-attribute-definitions/list-attribute-definitions.query");
const permissions_decorator_1 = require("../identity/permissions.decorator");
const add_eligibility_rule_command_1 = require("../../application/access/commands/add-eligibility-rule/add-eligibility-rule.command");
const remove_eligibility_rule_command_1 = require("../../application/access/commands/remove-eligibility-rule/remove-eligibility-rule.command");
const list_eligibility_rules_query_1 = require("../../application/access/queries/list-eligibility-rules/list-eligibility-rules.query");
const create_attribute_definition_command_1 = require("../../application/access/commands/create-attribute-definition/create-attribute-definition.command");
const add_eligibility_rule_dto_1 = require("./dto/add-eligibility-rule.dto");
const create_attribute_definition_dto_1 = require("./dto/create-attribute-definition.dto");
let AccessController = class AccessController {
    queryBus;
    commandBus;
    constructor(queryBus, commandBus) {
        this.queryBus = queryBus;
        this.commandBus = commandBus;
    }
    attributes() {
        return this.queryBus.execute(new list_attribute_definitions_query_1.ListAttributeDefinitionsQuery());
    }
    createAttribute(dto) {
        return this.commandBus.execute(new create_attribute_definition_command_1.CreateAttributeDefinitionCommand({
            code: dto.code,
            labelAr: dto.labelAr,
            labelEn: dto.labelEn,
            dataType: dto.dataType,
            descriptionAr: dto.descriptionAr,
            descriptionEn: dto.descriptionEn,
            options: dto.options,
        }));
    }
    eligibleTemplates(userId) {
        return this.queryBus.execute(new list_eligible_templates_query_1.ListEligibleTemplatesQuery(userId));
    }
    checkEligibility(userId, templateId) {
        return this.queryBus.execute(new check_template_eligibility_query_1.CheckTemplateEligibilityQuery(userId, templateId));
    }
    listRules(templateId) {
        return this.queryBus.execute(new list_eligibility_rules_query_1.ListEligibilityRulesQuery(templateId));
    }
    addRule(templateId, dto) {
        return this.commandBus.execute(new add_eligibility_rule_command_1.AddEligibilityRuleCommand({
            templateId,
            attributeCode: dto.attributeCode,
            operator: dto.operator,
            value: dto.value,
        }));
    }
    removeRule(templateId, ruleId) {
        return this.commandBus.execute(new remove_eligibility_rule_command_1.RemoveEligibilityRuleCommand({ templateId, ruleId }));
    }
};
exports.AccessController = AccessController;
__decorate([
    (0, common_1.Get)('attributes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AccessController.prototype, "attributes", null);
__decorate([
    (0, common_1.Post)('attributes'),
    (0, permissions_decorator_1.RequirePermissions)('template.manage'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_attribute_definition_dto_1.CreateAttributeDefinitionDto]),
    __metadata("design:returntype", Promise)
], AccessController.prototype, "createAttribute", null);
__decorate([
    (0, common_1.Get)('users/:userId/eligible-templates'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccessController.prototype, "eligibleTemplates", null);
__decorate([
    (0, common_1.Get)('users/:userId/templates/:templateId/eligibility'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccessController.prototype, "checkEligibility", null);
__decorate([
    (0, common_1.Get)('templates/:templateId/eligibility-rules'),
    __param(0, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccessController.prototype, "listRules", null);
__decorate([
    (0, common_1.Post)('templates/:templateId/eligibility-rules'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_eligibility_rule_dto_1.AddEligibilityRuleDto]),
    __metadata("design:returntype", Promise)
], AccessController.prototype, "addRule", null);
__decorate([
    (0, common_1.Delete)('templates/:templateId/eligibility-rules/:ruleId'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccessController.prototype, "removeRule", null);
exports.AccessController = AccessController = __decorate([
    (0, common_1.Controller)('access'),
    (0, permissions_decorator_1.RequirePermissions)('template.manage', 'user.manage'),
    __metadata("design:paramtypes", [cqrs_1.QueryBus,
        cqrs_1.CommandBus])
], AccessController);
//# sourceMappingURL=access.controller.js.map