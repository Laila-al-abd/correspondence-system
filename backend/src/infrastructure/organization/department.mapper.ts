import { Department } from '../../domain/organization/department'
import { Identifier } from '../../domain/shared/identifier'
import { LocalizedText } from '../../domain/shared/localized-text'
import { ExternalRef } from '../../domain/organization/value-objects/external-ref'
import {
  Prisma,
  Department as DepartmentRow,
} from '../../../generated/prisma/client'

/**
 * Translates between the Department aggregate and the `departments` row.
 * Bilingual JSONB columns become LocalizedText; the external personnel identity
 * (externalId + sourceSystem) becomes an ExternalRef value object.
 */
export const DepartmentMapper = {
  toDomain(row: DepartmentRow): Department {
    const name = row.name as unknown as { ar: string; en?: string }
    const description = row.description as unknown as {
      ar: string
      en?: string
    } | null
    return Department.rehydrate(Identifier.of(row.id), {
      parentId: row.parentId ? Identifier.of(row.parentId) : undefined,
      unitTypeId: Identifier.of(row.unitTypeId),
      name: LocalizedText.create(name.ar, name.en),
      description: description
        ? LocalizedText.create(description.ar, description.en)
        : undefined,
      isActive: row.isActive,
      externalRef: row.externalId
        ? ExternalRef.create(row.externalId, row.sourceSystem)
        : undefined,
      sourceSystem: row.sourceSystem,
      lastSyncedAt: row.lastSyncedAt ?? undefined,
    })
  },

  toPersistence(department: Department): Prisma.DepartmentUncheckedCreateInput {
    const s = department.snapshot()
    return {
      id: BigInt(department.id.toString()),
      parentId: s.parentId ? BigInt(s.parentId) : null,
      unitTypeId: BigInt(s.unitTypeId),
      name: s.name as Prisma.InputJsonValue,
      description: s.description
        ? (s.description as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      isActive: s.isActive,
      externalId: s.externalId ?? null,
      sourceSystem: s.sourceSystem,
      lastSyncedAt: s.lastSyncedAt ?? null,
    }
  },
}
