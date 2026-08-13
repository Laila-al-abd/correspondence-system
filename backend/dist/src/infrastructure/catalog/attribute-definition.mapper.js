"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeDefinitionMapper = exports.attributeInclude = void 0;
const attribute_definition_1 = require("../../domain/catalog/attribute-definition");
const attribute_option_1 = require("../../domain/catalog/attribute-option");
const identifier_1 = require("../../domain/shared/identifier");
const localized_text_1 = require("../../domain/shared/localized-text");
const toLocalized = (json) => {
    const value = json;
    return localized_text_1.LocalizedText.create(value.ar, value.en);
};
exports.attributeInclude = {
    options: true,
};
exports.AttributeDefinitionMapper = {
    toDomain(row) {
        return attribute_definition_1.AttributeDefinition.rehydrate(identifier_1.Identifier.of(row.id), {
            code: row.code,
            label: toLocalized(row.label),
            dataType: row.dataType,
            description: row.description ? toLocalized(row.description) : undefined,
            options: [...row.options]
                .sort((a, b) => a.ordinal - b.ordinal)
                .map((o) => attribute_option_1.AttributeOption.rehydrate(identifier_1.Identifier.of(o.id), {
                value: o.value,
                label: toLocalized(o.label),
                ordinal: o.ordinal,
            })),
        });
    },
};
//# sourceMappingURL=attribute-definition.mapper.js.map