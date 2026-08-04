import { Injectable } from '@nestjs/common'
import { Prisma } from '../../../generated/prisma/client'
import type {
  DelegationQueryPort,
  DelegationView,
  ListDelegationsFilter,
} from '../../application/identity/ports/delegation-query.port'
import {
  OffsetPage,
  clampLimit,
  clampOffset,
} from '../../application/shared/pagination'
import { PrismaService } from '../persistence/prisma.service'

const withUsers = {
  delegator: true,
  delegate: true,
} satisfies Prisma.DelegationInclude

type DelegationRow = Prisma.DelegationGetPayload<{ include: typeof withUsers }>

/**
 * Prisma-backed read model for delegations. Joins the delegator and delegate
 * users so the views can carry their names. Nothing here mutates state.
 */
@Injectable()
export class PrismaDelegationQuery implements DelegationQueryPort {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    filter: ListDelegationsFilter,
  ): Promise<OffsetPage<DelegationView>> {
    const limit = clampLimit(filter.limit)
    const offset = clampOffset(filter.offset)
    const where: Prisma.DelegationWhereInput = { deletedAt: null }
    if (filter.delegatorId) where.delegatorId = filter.delegatorId
    if (filter.delegateId) where.delegateId = filter.delegateId
    if (filter.activeOnly) where.isActive = true
    if (filter.onDate) {
      const day = new Date(filter.onDate)
      where.startDate = { lte: day }
      where.endDate = { gte: day }
    }

    const [total, rows] = await Promise.all([
      this.prisma.delegation.count({ where }),
      this.prisma.delegation.findMany({
        where,
        include: withUsers,
        // startDate is not unique, so it cannot order a page on its own: two
        // delegations starting the same day could swap places between page one
        // and page two and one of them would never be shown. id breaks the tie.
        orderBy: [{ startDate: 'desc' }, { id: 'desc' }],
        skip: offset,
        take: limit,
      }),
    ])
    return { total, limit, offset, items: rows.map((row) => toView(row)) }
  }

  async getById(id: string): Promise<DelegationView | null> {
    const row = await this.prisma.delegation.findFirst({
      where: { id: id, deletedAt: null },
      include: withUsers,
    })
    return row ? toView(row) : null
  }
}

function toView(row: DelegationRow): DelegationView {
  return {
    id: row.id.toString(),
    delegatorId: row.delegatorId.toString(),
    delegatorName: {
      ar: row.delegator.fullNameAr,
      en: row.delegator.fullNameEn ?? undefined,
    },
    delegateId: row.delegateId.toString(),
    delegateName: {
      ar: row.delegate.fullNameAr,
      en: row.delegate.fullNameEn ?? undefined,
    },
    startDate: row.startDate.toISOString().slice(0, 10),
    endDate: row.endDate.toISOString().slice(0, 10),
    isActive: row.isActive,
    reason: row.reason ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}
