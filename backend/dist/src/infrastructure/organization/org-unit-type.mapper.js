"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgUnitTypeMapper = void 0;
const org_unit_type_1 = require("../../domain/organization/org-unit-type");
const identifier_1 = require("../../domain/shared/identifier");
const localized_text_1 = require("../../domain/shared/localized-text");
exports.OrgUnitTypeMapper = {
    toDomain(row) {
        const name = row.name;
        return org_unit_type_1.OrgUnitType.rehydrate(identifier_1.Identifier.of(row.id), {
            kind: row.code,
            name: localized_text_1.LocalizedText.create(name.ar, name.en),
        });
    },
};
//# sourceMappingURL=org-unit-type.mapper.js.map