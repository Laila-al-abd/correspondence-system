import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { NotificationRepository } from '../../../../domain/observability/ports/notification.repository'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import { NOTIFICATION_REPOSITORY } from '../../../tokens'
import { PurgeResult } from '../../queries/views/notification.view'
import { PurgeOldNotificationsCommand } from './purge-old-notifications.command'

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Retention policy for the notifications table: anything older than the window
 * is removed. Notifications are transient UI messages -- the permanent record
 * of what happened lives in the event log and the request action history, so
 * deleting them loses no audit information.
 */
@CommandHandler(PurgeOldNotificationsCommand)
export class PurgeOldNotificationsHandler
  implements ICommandHandler<PurgeOldNotificationsCommand, PurgeResult>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notifications: NotificationRepository,
  ) {}

  async execute({
    retentionDays,
  }: PurgeOldNotificationsCommand): Promise<PurgeResult> {
    if (!Number.isFinite(retentionDays) || retentionDays < 1)
      throw new InvariantViolationError(
        'Retention must be at least one day.',
      )

    const cutoff = new Date(Date.now() - retentionDays * MS_PER_DAY)
    const deleted = await this.notifications.deleteOlderThan(cutoff)
    return { deleted, retentionDays, cutoff: cutoff.toISOString() }
  }
}
