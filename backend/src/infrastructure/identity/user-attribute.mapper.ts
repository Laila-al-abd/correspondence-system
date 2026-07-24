import type { UserAttribute as UserAttributeRow } from '../../../generated/prisma/client'
import { UserAttribute } from '../../domain/identity/user-attribute'
import { Identifier } from '../../domain/shared/identifier'

/** Maps the user_attributes row to the UserAttribute entity. */
export const UserAttributeMapper = {
  toDomain(row: UserAttributeRow): UserAttribute {
    return UserAttribute.rehydrate(Identifier.of(row.id), {
      userId: Identifier.of(row.userId),
      attributeId: Identifier.of(row.attributeId),
      value: row.value,
    })
  },
}
