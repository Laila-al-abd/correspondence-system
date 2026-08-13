import { ICommandHandler } from '@nestjs/cqrs';
import type { NotificationRepository } from '../../../../domain/observability/ports/notification.repository';
import { NotificationView } from '../../queries/views/notification.view';
import { MarkNotificationReadCommand } from './mark-notification-read.command';
export declare class MarkNotificationReadHandler implements ICommandHandler<MarkNotificationReadCommand, NotificationView> {
    private readonly notifications;
    constructor(notifications: NotificationRepository);
    execute({ notificationId, userId, }: MarkNotificationReadCommand): Promise<NotificationView>;
}
