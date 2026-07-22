import { Injectable } from '@nestjs/common'
import { Document } from '../../domain/request/document'
import { DocumentRepository } from '../../domain/request/ports/document.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { DocumentMapper } from './document.mapper'

/**
 * Prisma-backed DocumentRepository over the `documents` table. Stores only the
 * file metadata and its object-storage key; the bytes live in MinIO.
 */
@Injectable()
export class PrismaDocumentRepository implements DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<Document | null> {
    const row = await this.prisma.document.findFirst({
      where: { id: BigInt(id.toString()) },
    })
    return row ? DocumentMapper.toDomain(row) : null
  }

  async save(document: Document): Promise<void> {
    const data = DocumentMapper.toPersistence(document)
    await this.prisma.document.upsert({
      where: { id: BigInt(document.id.toString()) },
      create: data,
      update: data,
    })
  }

  async listByRequest(requestId: Identifier): Promise<Document[]> {
    const rows = await this.prisma.document.findMany({
      where: { requestId: BigInt(requestId.toString()) },
      orderBy: { id: 'asc' },
    })
    return rows.map((row) => DocumentMapper.toDomain(row))
  }
}
