import { Injectable } from '@nestjs/common'
import { UserAttributeRepository } from '../../domain/identity/ports/user-attribute.repository'
import { UserAttribute } from '../../domain/identity/user-attribute'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { UserAttributeMapper } from './user-attribute.mapper'
import { Prisma } from '../../../generated/prisma/client'

/** Read/write adapter for a user's ABAC attribute values (user_attributes). */
@Injectable()
export class PrismaUserAttributeRepository implements UserAttributeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: Identifier): Promise<UserAttribute[]> {
    const rows = await this.prisma.userAttribute.findMany({
      where: { userId: BigInt(userId.toString()) },
      orderBy: { attributeId: 'asc' },
    })
    return rows.map((row) => UserAttributeMapper.toDomain(row))
  }

  async setValue(params: {
    userId: Identifier
    attributeId: Identifier
    value: unknown
  }): Promise<void> {
    const userId = BigInt(params.userId.toString())
    const attributeId = BigInt(params.attributeId.toString())
    const value = params.value as Prisma.InputJsonValue
    await this.prisma.userAttribute.upsert({
      where: { userId_attributeId: { userId, attributeId } },
      update: { value },
      create: { userId, attributeId, value },
    })
  }

  async clear(params: {
    userId: Identifier
    attributeId: Identifier
  }): Promise<void> {
    await this.prisma.userAttribute.deleteMany({
      where: {
        userId: BigInt(params.userId.toString()),
        attributeId: BigInt(params.attributeId.toString()),
      },
    })
  }
}
