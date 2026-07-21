import { Injectable } from '@nestjs/common'
import { Delegation } from '../../domain/identity/delegation'
import { DelegationRepository } from '../../domain/identity/ports/delegation.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { DelegationMapper } from './delegation.mapper'

/** Prisma-backed DelegationRepository over the `delegations` table. */
@Injectable()
export class PrismaDelegationRepository implements DelegationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<Delegation | null> {
    const row = await this.prisma.delegation.findFirst({
      where: { id: BigInt(id.toString()), deletedAt: null },
    })
    return row ? DelegationMapper.toDomain(row) : null
  }

  async save(delegation: Delegation): Promise<void> {
    const data = DelegationMapper.toPersistence(delegation)
    await this.prisma.delegation.upsert({
      where: { id: BigInt(delegation.id.toString()) },
      create: data,
      update: data,
    })
  }

  async activeFor(
    delegatorId: Identifier,
    on: Date,
  ): Promise<Delegation | null> {
    const row = await this.prisma.delegation.findFirst({
      where: {
        delegatorId: BigInt(delegatorId.toString()),
        isActive: true,
        deletedAt: null,
        startDate: { lte: on },
        endDate: { gte: on },
      },
      orderBy: { startDate: 'desc' },
    })
    return row ? DelegationMapper.toDomain(row) : null
  }
}
