import { Notification } from '../../domain/observability/notification';
import { NotificationRepository } from '../../domain/observability/ports/notification.repository';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaNotificationRepository implements NotificationRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get db();
    findById(id: Identifier): Promise<Notification | null>;
    listForUser(userId: Identifier, onlyUnread?: boolean): Promise<Notification[]>;
    pageForUser(userId: Identifier, options: {
        onlyUnread?: boolean;
        limit: number;
        offset: number;
    }): Promise<{
        rows: Notification[];
        total: number;
    }>;
    countUnread(userId: Identifier): Promise<number>;
    markAllRead(userId: Identifier): Promise<void>;
    deleteOlderThan(cutoff: Date): Promise<number>;
    existsFor(userId: Identifier, requestId: Identifier, type: string): Promise<boolean>;
    save(notification: Notification): Promise<void>;
}
