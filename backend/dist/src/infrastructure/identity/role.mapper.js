"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleMapper = void 0;
const role_1 = require("../../domain/identity/role");
const identifier_1 = require("../../domain/shared/identifier");
const localized_text_1 = require("../../domain/shared/localized-text");
const client_1 = require("../../../generated/prisma/client");
exports.RoleMapper = {
    toDomain(row, permissionCodes) {
        const name = row.name;
        const description = row.description;
        return role_1.Role.rehydrate(identifier_1.Identifier.of(row.id), {
            name: localized_text_1.LocalizedText.create(name.ar, name.en),
            description: description
                ? localized_text_1.LocalizedText.create(description.ar, description.en)
                : undefined,
            isSystem: row.isSystem,
            permissionCodes: new Set(permissionCodes),
            deletedAt: row.deletedAt ?? undefined,
        });
    },
    toPersistence(role) {
        const description = role.description?.toJSON();
        return {
            id: role.id.toString(),
            name: role.name.toJSON(),
            description: description
                ? description
                : client_1.Prisma.DbNull,
            isSystem: role.isSystem,
            deletedAt: role.deletedAt ?? null,
        };
    },
};
//# sourceMappingURL=role.mapper.js.map