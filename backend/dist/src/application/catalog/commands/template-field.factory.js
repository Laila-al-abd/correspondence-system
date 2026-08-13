"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateFieldProps = templateFieldProps;
exports.buildTemplateField = buildTemplateField;
const template_field_1 = require("../../../domain/catalog/template-field");
const template_field_option_1 = require("../../../domain/catalog/template-field-option");
const localized_text_1 = require("../../../domain/shared/localized-text");
function templateFieldProps(input, ordinal) {
    return {
        fieldKey: input.key,
        label: localized_text_1.LocalizedText.create(input.labelAr, input.labelEn),
        dataType: input.dataType,
        isRequired: input.isRequired ?? false,
        ordinal,
        extractionQuestion: input.extractionQuestion,
        options: (input.options ?? []).map((option, index) => template_field_option_1.TemplateFieldOption.create(option.value, localized_text_1.LocalizedText.create(option.labelAr, option.labelEn), index + 1)),
    };
}
function buildTemplateField(id, input, ordinal) {
    return template_field_1.TemplateField.create(id, templateFieldProps(input, ordinal));
}
//# sourceMappingURL=template-field.factory.js.map