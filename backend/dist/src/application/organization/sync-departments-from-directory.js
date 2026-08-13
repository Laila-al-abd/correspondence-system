"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncDepartmentsFromDirectory = void 0;
const department_1 = require("../../domain/organization/department");
const external_ref_1 = require("../../domain/organization/value-objects/external-ref");
const localized_text_1 = require("../../domain/shared/localized-text");
const domain_error_1 = require("../../domain/shared/domain-error");
class SyncDepartmentsFromDirectory {
    directory;
    departments;
    unitTypes;
    ids;
    transaction;
    constructor(directory, departments, unitTypes, ids, transaction) {
        this.directory = directory;
        this.departments = departments;
        this.unitTypes = unitTypes;
        this.ids = ids;
        this.transaction = transaction;
    }
    async execute(source) {
        const units = await this.directory.fetchUnits();
        const syncedAt = new Date();
        const unitTypeIdByCode = new Map();
        const unknownTypes = new Set();
        for (const code of new Set(units.map((u) => u.unitType))) {
            const unitType = await this.unitTypes.findByCode(code);
            if (unitType)
                unitTypeIdByCode.set(code, unitType.id);
            else
                unknownTypes.add(code);
        }
        if (unknownTypes.size > 0) {
            throw new domain_error_1.InvariantViolationError(`Unknown org-unit type(s) ${[...unknownTypes]
                .map((c) => `'${c}'`)
                .join(', ')} received from ${source}. ` +
                'Add them to unitTypeMap in the personnel-directory mapping file, ' +
                'or register them as org-unit types. Nothing was imported.');
        }
        return this.transaction.run(() => this.write(units, source, syncedAt, unitTypeIdByCode));
    }
    async write(units, source, syncedAt, unitTypeIdByCode) {
        const idByExternalId = new Map();
        let created = 0;
        let updated = 0;
        for (const unit of units) {
            const ref = external_ref_1.ExternalRef.create(unit.externalId, source);
            const unitTypeId = unitTypeIdByCode.get(unit.unitType);
            const name = localized_text_1.LocalizedText.create(unit.name.ar, unit.name.en);
            const existing = await this.departments.findByExternalRef(ref);
            if (existing) {
                existing.applyExternalUpdate(name, syncedAt, unitTypeId);
                await this.departments.save(existing);
                idByExternalId.set(unit.externalId, existing.id);
                updated += 1;
            }
            else {
                const department = department_1.Department.fromExternal(this.ids.next(), {
                    unitTypeId,
                    name,
                    externalRef: ref,
                    syncedAt,
                });
                await this.departments.save(department);
                idByExternalId.set(unit.externalId, department.id);
                created += 1;
            }
        }
        for (const unit of units) {
            if (!unit.parentExternalId)
                continue;
            const childId = idByExternalId.get(unit.externalId);
            const parentId = idByExternalId.get(unit.parentExternalId);
            if (!childId || !parentId)
                continue;
            const child = await this.departments.findById(childId);
            if (!child)
                continue;
            child.attachTo(parentId);
            await this.departments.save(child);
        }
        const seen = new Set(units.map((u) => u.externalId));
        let deactivated = 0;
        for (const department of await this.departments.listBySource(source)) {
            const ref = department.externalRef;
            if (!ref || seen.has(ref.id))
                continue;
            if (!department.isActive)
                continue;
            department.deactivate();
            await this.departments.save(department);
            deactivated += 1;
        }
        return { source, created, updated, deactivated, total: units.length };
    }
}
exports.SyncDepartmentsFromDirectory = SyncDepartmentsFromDirectory;
//# sourceMappingURL=sync-departments-from-directory.js.map