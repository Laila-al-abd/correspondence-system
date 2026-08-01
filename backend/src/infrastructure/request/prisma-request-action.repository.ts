import { Injectable } from '@nestjs/common'
import { RequestAction } from '../../domain/request/request-action'
import { RequestActionRepository } from '../../domain/request/ports/request-action.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { dbClient } from '../persistence/transaction-context'
import { RequestActionMapper } from './request-action.mapper'

/**
 * Prisma-backed RequestActionRepository: an append-and-read audit log of the
 * decisions taken on a request. Rows are immutable once written.
 */
@Injectable()
export class PrismaRequestActionRepository implements RequestActionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Reads and writes go through the open transaction when the caller started a
   * unit of work, and through the plain client otherwise.
   */
  private get db() {
    return dbClient(this.prisma)
  }

  async append(action: RequestAction, requestId: Identifier): Promise<void> {
    await this.db.requestAction.create({
      data: RequestActionMapper.toPersistence(action, requestId),
    })
  }

  async listByRequest(requestId: Identifier): Promise<RequestAction[]> {
    const rows = await this.db.requestAction.findMany({
      where: { requestId: requestId.toString() },
      orderBy: { id: 'asc' },
    })
    return rows.map((row) => RequestActionMapper.toDomain(row))
  }
}
