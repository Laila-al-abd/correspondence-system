import { Injectable } from '@nestjs/common'
import { EventLog } from '../../domain/observability/event-log'
import { EventLogRepository } from '../../domain/observability/ports/event-log.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { EventLogMapper } from './event-log.mapper'

/**
 * Prisma-backed EventLogRepository over the append-only `event_logs` table.
 * Entries are immutable, so this exposes only append and read-by-request.
 */
@Injectable()
export class PrismaEventLogRepository implements EventLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async append(event: EventLog): Promise<void> {
    await this.prisma.eventLog.create({
      data: EventLogMapper.toPersistence(event),
    })
  }

  async listByRequest(requestId: Identifier): Promise<EventLog[]> {
    const rows = await this.prisma.eventLog.findMany({
      where: { requestId: BigInt(requestId.toString()) },
      orderBy: { occurredAt: 'asc' },
    })
    return rows.map((row) => EventLogMapper.toDomain(row))
  }
}
