import { Department } from '../../domain/organization/department'
import { ExternalRef } from '../../domain/organization/value-objects/external-ref'
import type {
  DepartmentRepository,
  ExternalOrgUnit,
  PersonnelDirectory,
} from '../../domain/organization/ports/department.repository'
import type { OrgUnitTypeRepository } from '../../domain/organization/ports/org-unit-type.repository'
import type { IdGenerator } from '../../domain/shared/id-generator'
import type { TransactionRunner } from '../../domain/shared/transaction-runner'
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
 * Parent links are wired in a second pass, once every unit has an internal id,
 * so the directory may send children before their parents.
 *
 * The whole thing is all-or-nothing, in two layers:
 *
 *  1. Every unit type is resolved BEFORE the first write. A directory that
 *     sends a type this system has never heard of is a configuration problem
 *     -- the unitTypeMap in the YAML needs a new entry -- and the operator is
 *     told about every unrecognised type at once rather than discovering them
 *     one restart at a time.
 *  2. The writes themselves run inside a single transaction. Previously an
 *     error partway through left the earlier units committed and the rest
 *     missing, with parents unwired: a half-imported tree that looked like a
 *     successful import until somebody went looking for a department. Now a
 *     failed sync changes nothing and can simply be run again.
 *
 * Exposed over HTTP as POST /organization/departments/sync.
 */
export class SyncDepartmentsFromDirectory {
  constructor(
    private readonly directory: PersonnelDirectory,
    private readonly departments: DepartmentRepository,
    private readonly unitTypes: OrgUnitTypeRepository,
    private readonly ids: IdGenerator,
    private readonly transaction: TransactionRunner,
  ) {}

  async execute(source: string): Promise<SyncDepartmentsResult> {
    const units = await this.directory.fetchUnits()
    const syncedAt = new Date()

    // Pass 0 -- resolve every unit type up front, touching nothing. Distinct
    // codes only, so a thousand departments cost one lookup per type.
    const unitTypeIdByCode = new Map<string, Identifier>()
    const unknownTypes = new Set<string>()
    for (const code of new Set(units.map((u) => u.unitType))) {
      const unitType = await this.unitTypes.findByCode(code)
      if (unitType) unitTypeIdByCode.set(code, unitType.id)
      else unknownTypes.add(code)
    }
    if (unknownTypes.size > 0) {
      throw new InvariantViolationError(
        `Unknown org-unit type(s) ${[...unknownTypes]
          .map((c) => `'${c}'`)
          .join(', ')} received from ${source}. ` +
          'Add them to unitTypeMap in the personnel-directory mapping file, ' +
          'or register them as org-unit types. Nothing was imported.',
      )
    }

    return this.transaction.run(() => this.write(units, source, syncedAt, unitTypeIdByCode))
  }

  /** The write half, run as one unit of work by `execute`. */
  private async write(
    units: ExternalOrgUnit[],
    source: string,
    syncedAt: Date,
    unitTypeIdByCode: Map<string, Identifier>,
  ): Promise<SyncDepartmentsResult> {
    const idByExternalId = new Map<string, Identifier>()
    let created = 0
    let updated = 0

    // Pass 1: create or idempotently update each unit (parents wired later).
    for (const unit of units) {
      const ref = ExternalRef.create(unit.externalId, source)
      const unitTypeId = unitTypeIdByCode.get(unit.unitType)!
      const name = LocalizedText.create(unit.name.ar, unit.name.en)

      const existing = await this.departments.findByExternalRef(ref)
      if (existing) {
        existing.applyExternalUpdate(name, syncedAt)
        await this.departments.save(existing)
        idByExternalId.set(unit.externalId, existing.id)
        updated += 1
      } else {
        const department = Department.fromExternal(this.ids.next(), {
          unitTypeId,
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
