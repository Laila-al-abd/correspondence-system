import { Identifier } from "../../shared/identifier";
import { EventLog } from "../event-log";
export interface EventLogRepository {
    append(event: EventLog): Promise<void>;
    listByRequest(requestId: Identifier): Promise<EventLog[]>;
}
