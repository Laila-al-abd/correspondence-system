import { Injectable } from '@nestjs/common'
import type { NotificationAudiencePort } from '../../application/observability/ports/notification-audience.port'
import { PrismaService } from '../persistence/prisma.service'

/**
 * Prisma adapter for NotificationAudiencePort. Walks user_roles -> roles ->
 * role_permissions -> permissions to find everyone holding a permission code,
 * skipping expired role assignments and soft-deleted roles. `distinct` keeps a
 * user from being notified twice when two of their roles both grant the code.
 */
@Injectable()
export class PrismaNotificationAudience implements NotificationAudiencePort {
  constructor(private readonly prisma: PrismaService) {}

  async findUserIdsWithPermission(permissionCode: string): Promise<string[]> {
    const rows = await this.prisma.userRole.findMany({
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        role: {
          deletedAt: null,
          permissions: { some: { permission: { code: permissionCode } } },
        },
      },
      select: { userId: true },
      distinct: ['userId'],
    })
    return rows.map((row) => row.userId.toString())
  }
}
