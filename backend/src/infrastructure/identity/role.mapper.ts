import { Role } from '../../domain/identity/role'
import { Identifier } from '../../domain/shared/identifier'
import { LocalizedText } from '../../domain/shared/localized-text'
import { Prisma } from '../../../generated/prisma/client'
import type { Role as RoleRow } from '../../../generated/prisma/client'

type LocalizedJson = { ar: string; en?: string }

/**
 * Translates between the Role aggregate and the `roles` row. The aggregate holds
 * permission *codes*; those live in the `role_permissions` join table, so the
 * repository resolves them and passes them in here.
 */
export const RoleMapper = {
  toDomain(row: RoleRow, permissionCodes: string[]): Role {
    const name = row.name as unknown as LocalizedJson
    const description = row.description as unknown as LocalizedJson | null
    return Role.rehydrate(Identifier.of(row.id), {
      name: LocalizedText.create(name.ar, name.en),
      description: description
        ? LocalizedText.create(description.ar, description.en)
        : undefined,
      isSystem: row.isSystem,
      permissionCodes: new Set(permissionCodes),
      deletedAt: row.deletedAt ?? undefined,
    })
  },

  toPersistence(role: Role): Prisma.RoleUncheckedCreateInput {
    const description = role.description?.toJSON()
    return {
      id: role.id.toString(),
      name: role.name.toJSON() as Prisma.InputJsonValue,
      // A cleared description has to be written as SQL NULL, not as the JSON
      // value `null`: Prisma treats the two differently for a JsonB column, and
      // a stored JSON null would read back as a description that exists and is
      // empty.
      description: description
        ? (description as Prisma.InputJsonValue)
        : Prisma.DbNull,
      isSystem: role.isSystem,
      deletedAt: role.deletedAt ?? null,
    }
  },
}
