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
exports.UpdateTemplateHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const localized_text_1 = require("../../../../domain/shared/localized-text");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const update_template_command_1 = require("./update-template.command");
let UpdateTemplateHandler = class UpdateTemplateHandler {
    templates;
    categories;
    sensitivityLevels;
    constructor(templates, categories, sensitivityLevels) {
        this.templates = templates;
        this.categories = categories;
        this.sensitivityLevels = sensitivityLevels;
    }
    async execute({ input }) {
        const template = await this.templates.findById(identifier_1.Identifier.of(input.templateId));
        if (!template)
            throw new errors_1.EntityNotFoundError('Template', input.templateId);
        const before = template.snapshot();
        if (input.categoryId !== undefined) {
            const categoryId = identifier_1.Identifier.of(input.categoryId);
            if (!(await this.categories.findById(categoryId)))
                throw new errors_1.EntityNotFoundError('Request category', input.categoryId);
            template.setCategory(categoryId);
        }
        if (input.sensitivityLevelId !== undefined) {
            const sensitivityLevelId = identifier_1.Identifier.of(input.sensitivityLevelId);
            if (!(await this.sensitivityLevels.findById(sensitivityLevelId)))
                throw new errors_1.EntityNotFoundError('Sensitivity level', input.sensitivityLevelId);
            template.setSensitivityLevel(sensitivityLevelId);
        }
        if (input.code !== undefined) {
            const code = input.code.trim().toUpperCase();
            const holder = await this.templates.findByCode(code);
            if (holder && holder.id.toString() !== template.id.toString())
                throw new errors_1.TemplateCodeAlreadyInUseError(code);
            template.assignCode(code);
        }
        const touchesText = input.titleAr !== undefined ||
            input.titleEn !== undefined ||
            input.descriptionAr !== undefined ||
            input.descriptionEn !== undefined;
        if (touchesText) {
            const title = localized_text_1.LocalizedText.create(input.titleAr ?? before.title.ar, input.titleEn ?? before.title.en);
            const descriptionAr = input.descriptionAr === undefined
                ? before.description?.ar
                : input.descriptionAr;
            const descriptionEn = input.descriptionEn === undefined
                ? before.description?.en
                : input.descriptionEn;
            template.setText(title, descriptionAr
                ? localized_text_1.LocalizedText.create(descriptionAr, descriptionEn)
                : undefined);
        }
        if (input.defaultPriority !== undefined)
            template.setDefaultPriority(input.defaultPriority);
        if (input.classifierDocument !== undefined)
            template.setClassifierDocument(input.classifierDocument ?? undefined);
        if (input.isActive !== undefined) {
            if (input.isActive)
                template.activate();
            else
                template.deactivate();
        }
        await this.templates.save(template);
        return {
            id: template.id.toString(),
            code: template.code,
            isActive: template.isActive,
        };
    }
};
exports.UpdateTemplateHandler = UpdateTemplateHandler;
exports.UpdateTemplateHandler = UpdateTemplateHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_template_command_1.UpdateTemplateCommand),
    __param(0, (0, common_1.Inject)(tokens_1.TEMPLATE_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.REQUEST_CATEGORY_REPOSITORY)),
    __param(2, (0, common_1.Inject)(tokens_1.SENSITIVITY_LEVEL_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, Object])
], UpdateTemplateHandler);
//# sourceMappingURL=update-template.handler.js.map