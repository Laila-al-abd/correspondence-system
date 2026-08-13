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
exports.ListEligibleTemplatesHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const evaluate_eligibility_1 = require("../../evaluate-eligibility");
const eligible_template_view_1 = require("../views/eligible-template.view");
const list_eligible_templates_query_1 = require("./list-eligible-templates.query");
let ListEligibleTemplatesHandler = class ListEligibleTemplatesHandler {
    templates;
    evaluator;
    constructor(templates, evaluator) {
        this.templates = templates;
        this.evaluator = evaluator;
    }
    async execute({ userId, }) {
        const uid = identifier_1.Identifier.of(userId);
        const [templates, attributes, codes] = await Promise.all([
            this.templates.listActive(),
            this.evaluator.resolveAttributes(uid),
            this.evaluator.attributeCodeMap(),
        ]);
        const eligible = [];
        for (const template of templates) {
            const result = await this.evaluator.evaluateWith(uid, template, attributes, codes);
            if (result.eligible)
                eligible.push((0, eligible_template_view_1.toEligibleTemplateView)(template));
        }
        return eligible;
    }
};
exports.ListEligibleTemplatesHandler = ListEligibleTemplatesHandler;
exports.ListEligibleTemplatesHandler = ListEligibleTemplatesHandler = __decorate([
    (0, cqrs_1.QueryHandler)(list_eligible_templates_query_1.ListEligibleTemplatesQuery),
    __param(0, (0, common_1.Inject)(tokens_1.TEMPLATE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, evaluate_eligibility_1.EvaluateEligibility])
], ListEligibleTemplatesHandler);
//# sourceMappingURL=list-eligible-templates.handler.js.map