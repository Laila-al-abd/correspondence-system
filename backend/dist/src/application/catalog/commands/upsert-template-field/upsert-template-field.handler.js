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
exports.UpsertTemplateFieldHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const identifier_1 = require("../../../../domain/shared/identifier");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const template_field_factory_1 = require("../template-field.factory");
const upsert_template_field_command_1 = require("./upsert-template-field.command");
let UpsertTemplateFieldHandler = class UpsertTemplateFieldHandler {
    templates;
    ids;
    constructor(templates, ids) {
        this.templates = templates;
        this.ids = ids;
    }
    async execute({ input, }) {
        const template = await this.templates.findById(identifier_1.Identifier.of(input.templateId));
        if (!template)
            throw new errors_1.EntityNotFoundError('Template', input.templateId);
        const existing = template.field(input.field.key);
        const ordinal = input.ordinal ?? existing?.ordinal ?? template.nextOrdinal();
        if (existing) {
            existing.redefine((0, template_field_factory_1.templateFieldProps)(input.field, ordinal));
        }
        else {
            template.addField((0, template_field_factory_1.buildTemplateField)(this.ids.next(), input.field, ordinal));
        }
        await this.templates.save(template);
        return {
            templateId: template.id.toString(),
            fieldKey: input.field.key,
            created: !existing,
            ordinal,
        };
    }
};
exports.UpsertTemplateFieldHandler = UpsertTemplateFieldHandler;
exports.UpsertTemplateFieldHandler = UpsertTemplateFieldHandler = __decorate([
    (0, cqrs_1.CommandHandler)(upsert_template_field_command_1.UpsertTemplateFieldCommand),
    __param(0, (0, common_1.Inject)(tokens_1.TEMPLATE_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __metadata("design:paramtypes", [Object, Object])
], UpsertTemplateFieldHandler);
//# sourceMappingURL=upsert-template-field.handler.js.map