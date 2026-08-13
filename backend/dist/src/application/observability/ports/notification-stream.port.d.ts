import type { Observable } from 'rxjs';
import type { NotificationView } from '../queries/views/notification.view';
export type NotificationStreamEvent = NotificationView;
export interface NotificationStreamPort {
    publish(userId: string, event: NotificationStreamEvent): void;
    streamFor(userId: string): Observable<NotificationStreamEvent>;
}
