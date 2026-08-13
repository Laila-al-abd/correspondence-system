import { IQueryHandler } from '@nestjs/cqrs';
import type { NotificationRepository } from '../../../../domain/observability/ports/notification.repository';
import { UnreadCountView } from '../views/notification.view';
import { CountUnreadNotificationsQuery } from './count-unread-notifications.query';
export declare class CountUnreadNotificationsHandler implements IQueryHandler<CountUnreadNotificationsQuery, UnreadCountView> {
    private readonly notifications;
    constructor(notifications: NotificationRepository);
    execute(query: CountUnreadNotificationsQuery): Promise<UnreadCountView>;
}
