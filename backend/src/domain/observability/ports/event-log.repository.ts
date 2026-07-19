import { Identifier } from "../../shared/identifier"
import { EventLog } from "../event-log"

/** Append-only audit store. */
export interface EventLogRepository {
  append(event: EventLog): Promise<void>
  listByRequest(requestId: Identifier): Promise<EventLog[]>
}
