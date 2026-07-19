import { Repository } from "../../shared/repository"
import { Identifier } from "../../shared/identifier"
import { Request } from "../request"
import { RequestStatus } from "../enums"

export interface RequestRepository extends Repository<Request> {
  listByRequester(requesterId: Identifier): Promise<Request[]>
  listAssignedTo(userId: Identifier): Promise<Request[]>
  listByStatus(status: RequestStatus): Promise<Request[]>
}
