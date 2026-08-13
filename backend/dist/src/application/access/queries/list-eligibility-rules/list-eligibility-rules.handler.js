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
exports.ListEligibilityRulesHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const list_eligibility_rules_query_1 = require("./list-eligibility-rules.query");
let ListEligibilityRulesHandler = class ListEligibilityRulesHandler {
    templates;
    attributes;
    constructor(templates, attributes) {
        this.templates = templates;
        this.attributes = attributes;
    }
    async execute({ templateId, }) {
        const template = await this.templates.findById(identifier_1.Identifier.of(templateId));
        if (!template)
            throw new errors_1.EntityNotFoundError('Template', templateId);
        const definitions = await this.attributes.list();
        const codeById = new Map(definitions.map((def) => [def.id.toString(), def.code]));
        return template.snapshot().eligibilityRules.map((rule) => ({
            id: rule.id,
            templateId,
            attributeId: rule.attributeId,
            attributeCode: codeById.get(rule.attributeId) ?? null,
            operator: rule.operator,
            value: rule.value,
        }));
    }
};
exports.ListEligibilityRulesHandler = ListEligibilityRulesHandler;
exports.ListEligibilityRulesHandler = ListEligibilityRulesHandler = __decorate([
    (0, cqrs_1.QueryHandler)(list_eligibility_rules_query_1.ListEligibilityRulesQuery),
    __param(0, (0, common_1.Inject)(tokens_1.TEMPLATE_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.ATTRIBUTE_DEFINITION_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], ListEligibilityRulesHandler);
//# sourceMappingURL=list-eligibility-rules.handler.js.map