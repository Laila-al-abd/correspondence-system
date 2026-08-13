import { Prisma, EventLog as EventLogRow } from '../../../generated/prisma/client';
import { EventLog } from '../../domain/observability/event-log';
export declare const EventLogMapper: {
    toDomain(row: EventLogRow): EventLog;
    toPersistence(event: EventLog): Prisma.EventLogUncheckedCreateInput;
};
