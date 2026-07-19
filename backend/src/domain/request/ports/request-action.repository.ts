import { Identifier } from "../../shared/identifier"
import { RequestAction } from "../request-action"

// Append-and-read log of actions taken on a request (audit trail).
export interface RequestActionRepository {
  append(action: RequestAction, requestId: Identifier): Promise<void>
  listByRequest(requestId: Identifier): Promise<RequestAction[]>
}
