import { OnModuleDestroy } from '@nestjs/common';
import { Observable } from 'rxjs';
import type { NotificationStreamEvent, NotificationStreamPort } from '../../application/observability/ports/notification-stream.port';
export declare class InMemoryNotificationStream implements NotificationStreamPort, OnModuleDestroy {
    private readonly logger;
    private readonly events;
    publish(userId: string, event: NotificationStreamEvent): void;
    streamFor(userId: string): Observable<NotificationStreamEvent>;
    onModuleDestroy(): void;
}
