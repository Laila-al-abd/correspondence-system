import { IQueryHandler } from '@nestjs/cqrs';
import { Notification } from '../../../../domain/observability/notification';
import type { NotificationRepository } from '../../../../domain/observability/ports/notification.repository';
import { OffsetPage } from '../../../shared/pagination';
import { NotificationView } from '../views/notification.view';
import { ListMyNotificationsQuery } from './list-my-notifications.query';
export declare class ListMyNotificationsHandler implements IQueryHandler<ListMyNotificationsQuery, OffsetPage<NotificationView>> {
    private readonly notifications;
    constructor(notifications: NotificationRepository);
    execute(query: ListMyNotificationsQuery): Promise<OffsetPage<NotificationView>>;
}
export declare function toNotificationView(notification: Notification): NotificationView;
