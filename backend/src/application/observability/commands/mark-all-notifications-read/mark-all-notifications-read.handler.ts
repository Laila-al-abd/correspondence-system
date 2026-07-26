import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { NotificationRepository } from '../../../../domain/observability/ports/notification.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { NOTIFICATION_REPOSITORY } from '../../../tokens'
import { MarkReadResult } from '../../queries/views/notification.view'
import { MarkAllNotificationsReadCommand } from './mark-all-notifications-read.command'

/**
 * Marks everything unread as read. The count is read first so the response can
 * tell the caller how many messages were actually cleared.
 */
@CommandHandler(MarkAllNotificationsReadCommand)
export class MarkAllNotificationsReadHandler
  implements ICommandHandler<MarkAllNotificationsReadCommand, MarkReadResult>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notifications: NotificationRepository,
  ) {}

  async execute({
    userId,
  }: MarkAllNotificationsReadCommand): Promise<MarkReadResult> {
    const id = Identifier.of(userId)
    const marked = await this.notifications.countUnread(id)
    await this.notifications.markAllRead(id)
    return { marked }
  }
}
