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
exports.CreateAttributeDefinitionHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const attribute_definition_1 = require("../../../../domain/catalog/attribute-definition");
const attribute_option_1 = require("../../../../domain/catalog/attribute-option");
const domain_error_1 = require("../../../../domain/shared/domain-error");
const localized_text_1 = require("../../../../domain/shared/localized-text");
const tokens_1 = require("../../../tokens");
const attribute_definition_view_1 = require("../../queries/views/attribute-definition.view");
const create_attribute_definition_command_1 = require("./create-attribute-definition.command");
let CreateAttributeDefinitionHandler = class CreateAttributeDefinitionHandler {
    attributes;
    ids;
    constructor(attributes, ids) {
        this.attributes = attributes;
        this.ids = ids;
    }
    async execute({ input, }) {
        const code = input.code.trim().toLowerCase();
        const existing = await this.attributes.findByCode(code);
        if (existing)
            throw new domain_error_1.InvariantViolationError(`An attribute with the code "${code}" already exists. Attribute codes ` +
                'are how eligibility rules name what they compare, so they cannot be ' +
                'reused.');
        const dataType = input.dataType;
        const options = (input.options ?? []).map((option, index) => attribute_option_1.AttributeOption.create(this.ids.next(), {
            value: option.value.trim(),
            label: localized_text_1.LocalizedText.create(option.labelAr, option.labelEn),
            ordinal: option.ordinal ?? index,
        }));
        const definition = attribute_definition_1.AttributeDefinition.create(this.ids.next(), {
            code,
            label: localized_text_1.LocalizedText.create(input.labelAr, input.labelEn),
            dataType,
            description: input.descriptionAr
                ? localized_text_1.LocalizedText.create(input.descriptionAr, input.descriptionEn)
                : undefined,
            options,
        });
        await this.attributes.save(definition);
        return (0, attribute_definition_view_1.toAttributeDefinitionView)(definition);
    }
};
exports.CreateAttributeDefinitionHandler = CreateAttributeDefinitionHandler;
exports.CreateAttributeDefinitionHandler = CreateAttributeDefinitionHandler = __decorate([
    (0, cqrs_1.CommandHandler)(create_attribute_definition_command_1.CreateAttributeDefinitionCommand),
    __param(0, (0, common_1.Inject)(tokens_1.ATTRIBUTE_DEFINITION_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.ID_GENERATOR)),
    __metadata("design:paramtypes", [Object, Object])
], CreateAttributeDefinitionHandler);
//# sourceMappingURL=create-attribute-definition.handler.js.map