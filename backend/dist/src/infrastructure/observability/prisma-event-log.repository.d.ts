import { EventLog } from '../../domain/observability/event-log';
import { EventLogRepository } from '../../domain/observability/ports/event-log.repository';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaEventLogRepository implements EventLogRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get db();
    append(event: EventLog): Promise<void>;
    listByRequest(requestId: Identifier): Promise<EventLog[]>;
}
