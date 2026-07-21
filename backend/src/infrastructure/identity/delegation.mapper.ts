import { Delegation } from '../../domain/identity/delegation'
import { Identifier } from '../../domain/shared/identifier'
import type {
  Prisma,
  Delegation as DelegationRow,
} from '../../../generated/prisma/client'

/** Translates between the Delegation aggregate and the `delegations` row. */
export const DelegationMapper = {
  toDomain(row: DelegationRow): Delegation {
    return Delegation.rehydrate(Identifier.of(row.id), {
      delegatorId: Identifier.of(row.delegatorId),
      delegateId: Identifier.of(row.delegateId),
      start: row.startDate,
      end: row.endDate,
      isActive: row.isActive,
      reason: row.reason ?? undefined,
    })
  },

  toPersistence(delegation: Delegation): Prisma.DelegationUncheckedCreateInput {
    const s = delegation.snapshot()
    return {
      id: BigInt(delegation.id.toString()),
      delegatorId: BigInt(s.delegatorId),
      delegateId: BigInt(s.delegateId),
      startDate: s.start,
      endDate: s.end,
      isActive: s.isActive,
      reason: s.reason ?? null,
    }
  },
}
