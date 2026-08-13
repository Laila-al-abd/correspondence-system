"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionTypeMapper = exports.RequestCategoryMapper = exports.SensitivityLevelMapper = void 0;
const sensitivity_level_1 = require("../../domain/catalog/sensitivity-level");
const request_category_1 = require("../../domain/catalog/request-category");
const action_type_1 = require("../../domain/catalog/action-type");
const identifier_1 = require("../../domain/shared/identifier");
const localized_text_1 = require("../../domain/shared/localized-text");
const toLocalized = (json) => {
    const value = json;
    return localized_text_1.LocalizedText.create(value.ar, value.en);
};
exports.SensitivityLevelMapper = {
    toDomain(row) {
        return sensitivity_level_1.SensitivityLevel.rehydrate(identifier_1.Identifier.of(row.id), {
            name: toLocalized(row.name),
            rank: row.rank,
            description: row.description ? toLocalized(row.description) : undefined,
        });
    },
};
exports.RequestCategoryMapper = {
    toDomain(row) {
        return request_category_1.RequestCategory.rehydrate(identifier_1.Identifier.of(row.id), {
            name: toLocalized(row.name),
            description: row.description ? toLocalized(row.description) : undefined,
        });
    },
};
exports.ActionTypeMapper = {
    toDomain(row) {
        return action_type_1.ActionType.rehydrate(identifier_1.Identifier.of(row.id), {
            code: row.code,
            name: toLocalized(row.name),
            isTerminal: row.isTerminal,
        });
    },
};
//# sourceMappingURL=catalog-lookup.mapper.js.map