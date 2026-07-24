import {
  Prisma,
  Notification as NotificationRow,
} from '../../../generated/prisma/client'
import { Notification } from '../../domain/observability/notification'
import { Identifier } from '../../domain/shared/identifier'

/** Maps between the Notification aggregate and the `notifications` row. */
export const NotificationMapper = {
  toDomain(row: NotificationRow): Notification {
    return Notification.rehydrate(Identifier.of(row.id), {
      userId: Identifier.of(row.userId),
      requestId:
        row.requestId != null ? Identifier.of(row.requestId) : undefined,
      type: row.type,
      title: row.title,
      body: row.body ?? undefined,
      isRead: row.isRead,
      createdAt: row.createdAt,
    })
  },

  toPersistence(
    notification: Notification,
  ): Prisma.NotificationUncheckedCreateInput {
    const s = notification.snapshot()
    return {
      id: BigInt(notification.id.toString()),
      userId: BigInt(s.userId),
      requestId: s.requestId ? BigInt(s.requestId) : null,
      type: s.type,
      title: s.title,
      body: s.body ?? null,
      isRead: s.isRead,
      createdAt: s.createdAt,
    }
  },
}
