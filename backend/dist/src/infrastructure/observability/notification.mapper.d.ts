import { Prisma, Notification as NotificationRow } from '../../../generated/prisma/client';
import { Notification } from '../../domain/observability/notification';
export declare const NotificationMapper: {
    toDomain(row: NotificationRow): Notification;
    toPersistence(notification: Notification): Prisma.NotificationUncheckedCreateInput;
};
