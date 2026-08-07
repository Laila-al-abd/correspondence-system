import { Identifier } from "../../shared/identifier"
import { RequestAction } from "../request-action"

// Append-and-read log of actions taken on a request (audit trail).
export interface RequestActionRepository {
  append(action: RequestAction): Promise<void>
  listByRequest(requestId: Identifier): Promise<RequestAction[]>
}
