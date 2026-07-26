import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { NotificationRepository } from '../../../../domain/observability/ports/notification.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { NOTIFICATION_REPOSITORY } from '../../../tokens'
import { UnreadCountView } from '../views/notification.view'
import { CountUnreadNotificationsQuery } from './count-unread-notifications.query'

@QueryHandler(CountUnreadNotificationsQuery)
export class CountUnreadNotificationsHandler
  implements IQueryHandler<CountUnreadNotificationsQuery, UnreadCountView>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notifications: NotificationRepository,
  ) {}

  async execute(
    query: CountUnreadNotificationsQuery,
  ): Promise<UnreadCountView> {
    const unread = await this.notifications.countUnread(
      Identifier.of(query.userId),
    )
    return { unread }
  }
}
