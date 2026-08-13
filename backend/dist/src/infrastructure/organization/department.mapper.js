"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentMapper = void 0;
const department_1 = require("../../domain/organization/department");
const identifier_1 = require("../../domain/shared/identifier");
const localized_text_1 = require("../../domain/shared/localized-text");
const external_ref_1 = require("../../domain/organization/value-objects/external-ref");
const client_1 = require("../../../generated/prisma/client");
exports.DepartmentMapper = {
    toDomain(row) {
        const name = row.name;
        const description = row.description;
        return department_1.Department.rehydrate(identifier_1.Identifier.of(row.id), {
            parentId: row.parentId ? identifier_1.Identifier.of(row.parentId) : undefined,
            unitTypeId: identifier_1.Identifier.of(row.unitTypeId),
            name: localized_text_1.LocalizedText.create(name.ar, name.en),
            description: description
                ? localized_text_1.LocalizedText.create(description.ar, description.en)
                : undefined,
            isActive: row.isActive,
            externalRef: row.externalId
                ? external_ref_1.ExternalRef.create(row.externalId, row.sourceSystem)
                : undefined,
            sourceSystem: row.sourceSystem,
            lastSyncedAt: row.lastSyncedAt ?? undefined,
        });
    },
    toPersistence(department) {
        const s = department.snapshot();
        return {
            id: department.id.toString(),
            parentId: s.parentId ? s.parentId : null,
            unitTypeId: s.unitTypeId,
            name: s.name,
            description: s.description
                ? s.description
                : client_1.Prisma.JsonNull,
            isActive: s.isActive,
            externalId: s.externalId ?? null,
            sourceSystem: s.sourceSystem,
            lastSyncedAt: s.lastSyncedAt ?? null,
        };
    },
};
//# sourceMappingURL=department.mapper.js.map