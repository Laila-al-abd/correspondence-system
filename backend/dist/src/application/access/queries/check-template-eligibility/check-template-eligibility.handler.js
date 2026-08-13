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
exports.CheckTemplateEligibilityHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const evaluate_eligibility_1 = require("../../evaluate-eligibility");
const check_template_eligibility_query_1 = require("./check-template-eligibility.query");
let CheckTemplateEligibilityHandler = class CheckTemplateEligibilityHandler {
    templates;
    evaluator;
    constructor(templates, evaluator) {
        this.templates = templates;
        this.evaluator = evaluator;
    }
    async execute({ userId, templateId, }) {
        const template = await this.templates.findById(identifier_1.Identifier.of(templateId));
        if (!template)
            throw new errors_1.EntityNotFoundError('Template', templateId);
        return this.evaluator.evaluate(identifier_1.Identifier.of(userId), template);
    }
};
exports.CheckTemplateEligibilityHandler = CheckTemplateEligibilityHandler;
exports.CheckTemplateEligibilityHandler = CheckTemplateEligibilityHandler = __decorate([
    (0, cqrs_1.QueryHandler)(check_template_eligibility_query_1.CheckTemplateEligibilityQuery),
    __param(0, (0, common_1.Inject)(tokens_1.TEMPLATE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, evaluate_eligibility_1.EvaluateEligibility])
], CheckTemplateEligibilityHandler);
//# sourceMappingURL=check-template-eligibility.handler.js.map