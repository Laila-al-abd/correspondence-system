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
exports.CreateTemplateHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const template_1 = require("../../../../domain/catalog/template");
const identifier_1 = require("../../../../domain/shared/identifier");
const localized_text_1 = require("../../../../domain/shared/localized-text");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const template_field_factory_1 = require("../template-field.factory");
const create_template_command_1 = require("./create-template.command");
let CreateTemplateHandler = class CreateTemplateHandler {
    templates;
    categories;
    sensitivityLevels;
    ids;
    constructor(templates, categories, sensitivityLevels, ids) {
        this.templates = templates;
        this.categories = categories;
        this.sensitivityLevels = sensitivityLevels;
        this.ids = ids;
    }
    async execute({ input }) {
        let categoryId;
        if (input.categoryId !== undefined) {
            categoryId = identifier_1.Identifier.of(input.categoryId);
            if (!(await this.categories.findById(categoryId)))
                throw new errors_1.EntityNotFoundError('Request category', input.categoryId);
        }
        let sensitivityLevelId;
        if (input.sensitivityLevelId !== undefined) {
            sensitivityLevelId = identifier_1.Identifier.of(input.sensitivityLevelId);
            if (!(await this.sensitivityLevels.findById(sensitivityLevelId)))
                throw new errors_1.EntityNotFoundError('Sensitivity level', input.sensitivityLevelId);
        }
        if (input.code) {
            const code = input.code.trim().toUpperCase();
            if (await this.templates.findByCode(code))
                throw new errors_1.TemplateCodeAlreadyInUseError(code);
        }
        const template = template_1.Template.create(this.ids.next(), {
            code: input.code,
            categoryId,
            sensitivityLevelId,
            title: localized_text_1.LocalizedText.create(input.titleAr, input.titleEn),
            description: input.descriptionAr
                ? localized_text_1.LocalizedText.create(input.descriptionAr, input.descriptionEn)
                : undefined,
            defaultPriority: input.defaultPriority,
            classifierDocument: input.classifierDocument,
        });
        for (const [index, field] of (input.fields ?? []).entries()) {
            template.addField((0, template_field_factory_1.buildTemplateField)(this.ids.next(), field, index + 1));
        }
        await this.templates.save(template);
        return {
            id: template.id.toString(),
            code: template.code,
            fieldCount: template.fields.length,
        };
    }
};
exports.CreateTemplateHandler = CreateTemplateHandler;
exports.CreateTemplateHandler = CreateTemplateHandler = __decorate([
    (0, cqrs_1.CommandHandler)(create_template_command_1.CreateTemplateCommand),
    __param(0, (0, common_1.Inject)(tokens_1.TEMPLATE_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.REQUEST_CATEGORY_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.SENSITIVITY_LEVEL_REPOSITORY)),
    __param(3, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], CreateTemplateHandler);
//# sourceMappingURL=create-template.handler.js.map