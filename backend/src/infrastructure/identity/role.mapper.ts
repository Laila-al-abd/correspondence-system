import { Role } from '../../domain/identity/role'
import { Identifier } from '../../domain/shared/identifier'
import { LocalizedText } from '../../domain/shared/localized-text'
import type { Prisma, Role as RoleRow } from '../../../generated/prisma/client'

/**
 * Translates between the Role aggregate and the `roles` row. The aggregate holds
 * permission *codes*; those live in the `role_permissions` join table, so the
 * repository resolves them and passes them in here.
 */
export const RoleMapper = {
  toDomain(row: RoleRow, permissionCodes: string[]): Role {
    const name = row.name as unknown as { ar: string; en?: string }
    return Role.rehydrate(Identifier.of(row.id), {
      name: LocalizedText.create(name.ar, name.en),
      isSystem: row.isSystem,
      permissionCodes: new Set(permissionCodes),
    })
  },

  toPersistence(role: Role): Prisma.RoleUncheckedCreateInput {
    return {
      id: BigInt(role.id.toString()),
      name: role.name.toJSON() as Prisma.InputJsonValue,
      isSystem: role.isSystem,
    }
  },
}
