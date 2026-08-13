import { ICommandHandler } from '@nestjs/cqrs';
import type { NotificationRepository } from '../../../../domain/observability/ports/notification.repository';
import { PurgeResult } from '../../queries/views/notification.view';
import { PurgeOldNotificationsCommand } from './purge-old-notifications.command';
export declare class PurgeOldNotificationsHandler implements ICommandHandler<PurgeOldNotificationsCommand, PurgeResult> {
    private readonly notifications;
    constructor(notifications: NotificationRepository);
    execute({ retentionDays, }: PurgeOldNotificationsCommand): Promise<PurgeResult>;
}
