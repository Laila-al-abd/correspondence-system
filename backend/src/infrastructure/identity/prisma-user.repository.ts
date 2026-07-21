import { Injectable } from '@nestjs/common'
import { User } from '../../domain/identity/user'
import { UserRepository } from '../../domain/identity/ports/user.repository'
import { Email } from '../../domain/identity/value-objects/email'
import { InstitutionalNumber } from '../../domain/identity/value-objects/institutional-number'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { UserMapper } from './user.mapper'

/**
 * Prisma-backed UserRepository. Soft-deleted rows (deleted_at set) are treated as
 * absent. Ids come from the application's IdGenerator, so save() upserts on the
 * explicit id.
 */
@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<User | null> {
    const row = await this.prisma.user.findFirst({
      where: { id: BigInt(id.toString()), deletedAt: null },
    })
    return row ? UserMapper.toDomain(row) : null
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.prisma.user.findFirst({
      where: { email: email.value, deletedAt: null },
    })
    return row ? UserMapper.toDomain(row) : null
  }

  async findByInstitutionalNumber(
    n: InstitutionalNumber,
  ): Promise<User | null> {
    const row = await this.prisma.user.findFirst({
      where: { institutionalNumber: n.value, deletedAt: null },
    })
    return row ? UserMapper.toDomain(row) : null
  }

  async save(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user)
    await this.prisma.user.upsert({
      where: { id: BigInt(user.id.toString()) },
      create: data,
      update: data,
    })
  }
}
