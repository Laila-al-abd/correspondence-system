import { Injectable } from '@nestjs/common'
import { Notification } from '../../domain/observability/notification'
import { NotificationRepository } from '../../domain/observability/ports/notification.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { dbClient } from '../persistence/transaction-context'
import { NotificationMapper } from './notification.mapper'

/** Prisma-backed NotificationRepository over the `notifications` table. */
@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Reads and writes go through the open transaction when the caller started a
   * unit of work, and through the plain client otherwise.
   */
  private get db() {
    return dbClient(this.prisma)
  }

  async findById(id: Identifier): Promise<Notification | null> {
    const row = await this.db.notification.findFirst({
      where: { id: id.toString() },
    })
    return row ? NotificationMapper.toDomain(row) : null
  }

  async listForUser(
    userId: Identifier,
    onlyUnread = false,
  ): Promise<Notification[]> {
    const rows = await this.db.notification.findMany({
      where: {
        userId: userId.toString(),
        ...(onlyUnread ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => NotificationMapper.toDomain(row))
  }

  async pageForUser(
    userId: Identifier,
    options: { onlyUnread?: boolean; limit: number; offset: number },
  ): Promise<{ rows: Notification[]; total: number }> {
    const where = {
      userId: userId.toString(),
      ...(options.onlyUnread ? { isRead: false } : {}),
    }
    const [total, rows] = await Promise.all([
      this.db.notification.count({ where }),
      this.db.notification.findMany({
        where,
        // createdAt is not unique -- a workflow step can fan out several
        // notifications in the same millisecond -- so id breaks the tie and
        // keeps the page boundary stable.
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: options.offset,
        take: options.limit,
      }),
    ])
    return { rows: rows.map((row) => NotificationMapper.toDomain(row)), total }
  }

  async countUnread(userId: Identifier): Promise<number> {
    return this.db.notification.count({
      where: { userId: userId.toString(), isRead: false },
    })
  }

  async markAllRead(userId: Identifier): Promise<void> {
    await this.db.notification.updateMany({
      where: { userId: userId.toString(), isRead: false },
      data: { isRead: true },
    })
  }

  async deleteOlderThan(cutoff: Date): Promise<number> {
    const { count } = await this.db.notification.deleteMany({
      where: { createdAt: { lt: cutoff } },
    })
    return count
  }

  async existsFor(
    userId: Identifier,
    requestId: Identifier,
    type: string,
  ): Promise<boolean> {
    const found = await this.db.notification.findFirst({
      where: {
        userId: userId.toString(),
        requestId: requestId.toString(),
        type,
      },
      select: { id: true },
    })
    return found !== null
  }

  async save(notification: Notification): Promise<void> {
    const data = NotificationMapper.toPersistence(notification)
    await this.db.notification.upsert({
      where: { id: notification.id.toString() },
      create: data,
      update: data,
    })
  }
}
