import { Injectable } from '@nestjs/common'
import { Document } from '../../domain/request/document'
import { DocumentRepository } from '../../domain/request/ports/document.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { dbClient } from '../persistence/transaction-context'
import { DocumentMapper } from './document.mapper'

/**
 * Prisma-backed DocumentRepository over the `documents` table. Stores only the
 * file metadata and its object-storage key; the bytes live in MinIO.
 */
@Injectable()
export class PrismaDocumentRepository implements DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Reads and writes go through the open transaction when the caller started a
   * unit of work, and through the plain client otherwise.
   */
  private get db() {
    return dbClient(this.prisma)
  }

  async findById(id: Identifier): Promise<Document | null> {
    const row = await this.db.document.findFirst({
      where: { id: id.toString() },
    })
    return row ? DocumentMapper.toDomain(row) : null
  }

  async save(document: Document): Promise<void> {
    const data = DocumentMapper.toPersistence(document)
    await this.db.document.upsert({
      where: { id: document.id.toString() },
      create: data,
      update: data,
    })
  }

  async listByRequest(requestId: Identifier): Promise<Document[]> {
    const rows = await this.db.document.findMany({
      where: { requestId: requestId.toString() },
      orderBy: { id: 'asc' },
    })
    return rows.map((row) => DocumentMapper.toDomain(row))
  }
}
