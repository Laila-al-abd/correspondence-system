import { Department } from '../../domain/organization/department'
import { ExternalRef } from '../../domain/organization/value-objects/external-ref'
import type {
  DepartmentRepository,
  PersonnelDirectory,
} from '../../domain/organization/ports/department.repository'
import type { OrgUnitTypeRepository } from '../../domain/organization/ports/org-unit-type.repository'
import type { IdGenerator } from '../../domain/shared/id-generator'
import { Identifier } from '../../domain/shared/identifier'
import { LocalizedText } from '../../domain/shared/localized-text'
import { InvariantViolationError } from '../../domain/shared/domain-error'

export interface SyncDepartmentsResult {
  source: string
  created: number
  updated: number
  total: number
}

/**
 * Idempotent sync of the department tree from an external personnel directory.
 *
 * For each external unit it matches an existing row via `findByExternalRef`:
 *  - found     -> `applyExternalUpdate(...)` keeps the SAME internal id, so
 *                 manual edits and every foreign key stay intact.
 *  - not found -> `Department.fromExternal(...)` creates a fresh synced unit.
 *
 * Parent links are wired in a second pass, once every unit has an internal id.
 * This is a plain application service; wire it to a trigger or controller once
 * the PersonnelDirectory HTTP adapter is implemented.
 */
export class SyncDepartmentsFromDirectory {
  constructor(
    private readonly directory: PersonnelDirectory,
    private readonly departments: DepartmentRepository,
    private readonly unitTypes: OrgUnitTypeRepository,
    private readonly ids: IdGenerator,
  ) {}

  async execute(source: string): Promise<SyncDepartmentsResult> {
    const units = await this.directory.fetchUnits()
    const syncedAt = new Date()
    const idByExternalId = new Map<string, Identifier>()
    let created = 0
    let updated = 0

    // Pass 1: create or idempotently update each unit (parents wired later).
    for (const unit of units) {
      const ref = ExternalRef.create(unit.externalId, source)
      const unitType = await this.unitTypes.findByCode(unit.unitType)
      if (!unitType) {
        throw new InvariantViolationError(
          `Unknown org-unit type '${unit.unitType}' received from ${source}.`,
        )
      }
      const name = LocalizedText.create(unit.name.ar, unit.name.en)

      const existing = await this.departments.findByExternalRef(ref)
      if (existing) {
        existing.applyExternalUpdate(name, syncedAt)
        await this.departments.save(existing)
        idByExternalId.set(unit.externalId, existing.id)
        updated += 1
      } else {
        const department = Department.fromExternal(this.ids.next(), {
          unitTypeId: unitType.id,
          name,
          externalRef: ref,
          syncedAt,
        })
        await this.departments.save(department)
        idByExternalId.set(unit.externalId, department.id)
        created += 1
      }
    }

    // Pass 2: attach parents now that every external id maps to an internal id.
    for (const unit of units) {
      if (!unit.parentExternalId) continue
      const childId = idByExternalId.get(unit.externalId)
      const parentId = idByExternalId.get(unit.parentExternalId)
      if (!childId || !parentId) continue
      const child = await this.departments.findById(childId)
      if (!child) continue
      child.attachTo(parentId)
      await this.departments.save(child)
    }

    return { source, created, updated, total: units.length }
  }
}
