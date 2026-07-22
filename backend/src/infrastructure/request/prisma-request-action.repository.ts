import { Injectable } from '@nestjs/common'
import { RequestAction } from '../../domain/request/request-action'
import { RequestActionRepository } from '../../domain/request/ports/request-action.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { RequestActionMapper } from './request-action.mapper'

/**
 * Prisma-backed RequestActionRepository: an append-and-read audit log of the
 * decisions taken on a request. Rows are immutable once written.
 */
@Injectable()
export class PrismaRequestActionRepository implements RequestActionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async append(action: RequestAction, requestId: Identifier): Promise<void> {
    await this.prisma.requestAction.create({
      data: RequestActionMapper.toPersistence(action, requestId),
    })
  }

  async listByRequest(requestId: Identifier): Promise<RequestAction[]> {
    const rows = await this.prisma.requestAction.findMany({
      where: { requestId: BigInt(requestId.toString()) },
      orderBy: { id: 'asc' },
    })
    return rows.map((row) => RequestActionMapper.toDomain(row))
  }
}
