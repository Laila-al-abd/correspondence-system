"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSettingMapper = void 0;
const system_setting_1 = require("../../domain/observability/system-setting");
const identifier_1 = require("../../domain/shared/identifier");
exports.SystemSettingMapper = {
    toDomain(row) {
        return system_setting_1.SystemSetting.rehydrate(identifier_1.Identifier.of(row.id), {
            key: row.key,
            value: row.value,
            description: row.description ?? undefined,
            updatedBy: row.updatedBy != null ? identifier_1.Identifier.of(row.updatedBy) : undefined,
            updatedAt: row.updatedAt,
        });
    },
    toPersistence(setting) {
        const s = setting.snapshot();
        return {
            id: setting.id.toString(),
            key: s.key,
            value: s.value,
            description: s.description ?? null,
            updatedBy: s.updatedBy ? s.updatedBy : null,
            updatedAt: s.updatedAt,
        };
    },
};
//# sourceMappingURL=system-setting.mapper.js.map