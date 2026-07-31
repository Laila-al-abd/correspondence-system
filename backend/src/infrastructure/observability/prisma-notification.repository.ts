import { Injectable } from '@nestjs/common'
import { Notification } from '../../domain/observability/notification'
import { NotificationRepository } from '../../domain/observability/ports/notification.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { NotificationMapper } from './notification.mapper'

/** Prisma-backed NotificationRepository over the `notifications` table. */
@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<Notification | null> {
    const row = await this.prisma.notification.findFirst({
      where: { id: id.toString() },
    })
    return row ? NotificationMapper.toDomain(row) : null
  }

  async listForUser(
    userId: Identifier,
    onlyUnread = false,
  ): Promise<Notification[]> {
    const rows = await this.prisma.notification.findMany({
      where: {
        userId: userId.toString(),
        ...(onlyUnread ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => NotificationMapper.toDomain(row))
  }

  async countUnread(userId: Identifier): Promise<number> {
    return this.prisma.notification.count({
      where: { userId: userId.toString(), isRead: false },
    })
  }

  async markAllRead(userId: Identifier): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId: userId.toString(), isRead: false },
      data: { isRead: true },
    })
  }

  async deleteOlderThan(cutoff: Date): Promise<number> {
    const { count } = await this.prisma.notification.deleteMany({
      where: { createdAt: { lt: cutoff } },
    })
    return count
  }

  async existsFor(
    userId: Identifier,
    requestId: Identifier,
    type: string,
  ): Promise<boolean> {
    const found = await this.prisma.notification.findFirst({
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
    await this.prisma.notification.upsert({
      where: { id: notification.id.toString() },
      create: data,
      update: data,
    })
  }
}
