import { Injectable } from '@nestjs/common'
import { UserAttributeRepository } from '../../domain/identity/ports/user-attribute.repository'
import { UserAttribute } from '../../domain/identity/user-attribute'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { UserAttributeMapper } from './user-attribute.mapper'

/** Read adapter for a user's ABAC attribute values (user_attributes). */
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
}
