import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { NotificationRepository } from '../../../../domain/observability/ports/notification.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import { NOTIFICATION_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError, ForbiddenActionError } from '../../../errors'
import { NotificationView } from '../../queries/views/notification.view'
import { toNotificationView } from '../../queries/list-my-notifications/list-my-notifications.handler'
import { MarkNotificationReadCommand } from './mark-notification-read.command'

/**
 * Marks a single notification read. Ownership is enforced here rather than in
 * the controller: a notification belongs to exactly one user, and reading
 * somebody else's inbox is a 403, not a 404.
 */
@CommandHandler(MarkNotificationReadCommand)
export class MarkNotificationReadHandler
  implements ICommandHandler<MarkNotificationReadCommand, NotificationView>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notifications: NotificationRepository,
  ) {}

  async execute({
    notificationId,
    userId,
  }: MarkNotificationReadCommand): Promise<NotificationView> {
    const notification = await this.notifications.findById(
      Identifier.of(notificationId),
    )
    if (!notification)
      throw new EntityNotFoundError('Notification', notificationId)

    if (notification.userId.toString() !== userId)
      throw new ForbiddenActionError(
        'You can only read your own notifications.',
      )

    notification.markRead()
    await this.notifications.save(notification)
    return toNotificationView(notification)
  }
}
