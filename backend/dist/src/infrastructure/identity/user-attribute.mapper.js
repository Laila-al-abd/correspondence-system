"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAttributeMapper = void 0;
const user_attribute_1 = require("../../domain/identity/user-attribute");
const identifier_1 = require("../../domain/shared/identifier");
exports.UserAttributeMapper = {
    toDomain(row) {
        return user_attribute_1.UserAttribute.rehydrate(identifier_1.Identifier.of(row.id), {
            userId: identifier_1.Identifier.of(row.userId),
            attributeId: identifier_1.Identifier.of(row.attributeId),
            value: row.value,
        });
    },
};
//# sourceMappingURL=user-attribute.mapper.js.map