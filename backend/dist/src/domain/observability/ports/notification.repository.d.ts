import { Repository } from "../../shared/repository";
import { Identifier } from "../../shared/identifier";
import { Notification } from "../notification";
export interface NotificationRepository extends Repository<Notification> {
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
}
