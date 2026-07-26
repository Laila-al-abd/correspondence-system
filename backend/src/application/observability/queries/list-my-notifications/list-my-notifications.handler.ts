import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Notification } from '../../../../domain/observability/notification'
import type { NotificationRepository } from '../../../../domain/observability/ports/notification.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { NOTIFICATION_REPOSITORY } from '../../../tokens'
import { NotificationView } from '../views/notification.view'
import { ListMyNotificationsQuery } from './list-my-notifications.query'

@QueryHandler(ListMyNotificationsQuery)
export class ListMyNotificationsHandler
  implements IQueryHandler<ListMyNotificationsQuery, NotificationView[]>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notifications: NotificationRepository,
  ) {}

  async execute(
    query: ListMyNotificationsQuery,
  ): Promise<NotificationView[]> {
    const rows = await this.notifications.listForUser(
      Identifier.of(query.userId),
      query.onlyUnread,
    )
    return rows.map((row) => toNotificationView(row))
  }
}

export function toNotificationView(
  notification: Notification,
): NotificationView {
  const snapshot = notification.snapshot()
  return {
    id: notification.id.toString(),
    type: snapshot.type,
    title: snapshot.title,
    body: snapshot.body ?? null,
    requestId: snapshot.requestId ?? null,
    isRead: snapshot.isRead,
    createdAt: snapshot.createdAt.toISOString(),
  }
}
