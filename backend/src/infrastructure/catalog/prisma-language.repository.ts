import { Injectable } from '@nestjs/common'
import { Language } from '../../domain/catalog/language'
import { LanguageRepository } from '../../domain/catalog/ports/language.repository'
import { PrismaService } from '../persistence/prisma.service'
import { LanguageMapper } from './language.mapper'

/**
 * Prisma-backed LanguageRepository. Maps to the real `languages` table, so this
 * adapter compiles and runs against the current schema.
 */
@Injectable()
export class PrismaLanguageRepository implements LanguageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCode(code: string): Promise<Language | null> {
    const row = await this.prisma.language.findUnique({ where: { code } })
    return row ? LanguageMapper.toDomain(row) : null
  }

  async list(): Promise<Language[]> {
    const rows = await this.prisma.language.findMany({ orderBy: { code: 'asc' } })
    return rows.map((row) => LanguageMapper.toDomain(row))
  }

  async save(language: Language): Promise<void> {
    const data = LanguageMapper.toPersistence(language)
    await this.prisma.language.upsert({
      where: { code: data.code },
      create: data,
      update: data,
    })
  }
}
