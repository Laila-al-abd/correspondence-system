"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageMapper = void 0;
const language_1 = require("../../domain/catalog/language");
exports.LanguageMapper = {
    toDomain(row) {
        return language_1.Language.rehydrate({
            code: row.code,
            name: row.name,
            nativeName: row.nativeName,
            isEnabled: row.isEnabled,
            isDefault: row.isDefault,
        });
    },
    toPersistence(language) {
        const props = language.toJSON();
        return {
            code: props.code,
            name: props.name,
            nativeName: props.nativeName,
            isEnabled: props.isEnabled,
            isDefault: props.isDefault,
        };
    },
};
//# sourceMappingURL=language.mapper.js.map