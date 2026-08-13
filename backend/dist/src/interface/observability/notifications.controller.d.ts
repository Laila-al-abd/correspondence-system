import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { StreamTicketService } from '../../infrastructure/observability/stream-ticket.service';
import type { NotificationStreamPort } from '../../application/observability/ports/notification-stream.port';
import type { MarkReadResult, NotificationView, PurgeResult, UnreadCountView } from '../../application/observability/queries/views/notification.view';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { OffsetPage } from '../../application/shared/pagination';
import { PurgeNotificationsDto } from './dto/purge-notifications.dto';
interface SseMessage {
    type: string;
    data: string | object;
}
interface StreamRequest {
    headers?: Record<string, string | string[] | undefined>;
    query?: Record<string, unknown>;
}
export declare class NotificationsController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly streamPort;
    private readonly tickets;
    constructor(commandBus: CommandBus, queryBus: QueryBus, streamPort: NotificationStreamPort, tickets: StreamTicketService);
    list(userId: string, dto: ListNotificationsDto): Promise<OffsetPage<NotificationView>>;
    countUnread(userId: string): Promise<UnreadCountView>;
    stream(request: StreamRequest): Observable<SseMessage>;
    streamTicket(userId: string): {
        ticket: string;
        expiresInSeconds: number;
    };
    markAllRead(userId: string): Promise<MarkReadResult>;
    purge(dto: PurgeNotificationsDto): Promise<PurgeResult>;
    markRead(userId: string, id: string): Promise<NotificationView>;
    private notificationEvents;
    private authenticateByTicket;
}
export {};
