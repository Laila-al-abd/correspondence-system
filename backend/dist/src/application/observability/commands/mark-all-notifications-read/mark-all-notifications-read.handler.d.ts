import { ICommandHandler } from '@nestjs/cqrs';
import type { NotificationRepository } from '../../../../domain/observability/ports/notification.repository';
import { MarkReadResult } from '../../queries/views/notification.view';
import { MarkAllNotificationsReadCommand } from './mark-all-notifications-read.command';
export declare class MarkAllNotificationsReadHandler implements ICommandHandler<MarkAllNotificationsReadCommand, MarkReadResult> {
    private readonly notifications;
    constructor(notifications: NotificationRepository);
    execute({ userId, }: MarkAllNotificationsReadCommand): Promise<MarkReadResult>;
}
