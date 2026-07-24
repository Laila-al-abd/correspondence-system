import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Request } from '../../../../domain/request/request'
import { RequestStatus } from '../../../../domain/request/enums'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import { REQUEST_REPOSITORY } from '../../../tokens'
import { ListRequestQueueQuery } from './list-request-queue.query'
import { RequestSummaryView, toRequestSummary } from '../views/request.view'

/**
 * A work queue of requests in a given status, ordered the way staff should pick
 * them up: business priority first, then SLA urgency, then the nearest due date
 * (Request.compareForQueue) -- the two-axis ordering the domain defines.
 */
@QueryHandler(ListRequestQueueQuery)
export class ListRequestQueueHandler
  implements IQueryHandler<ListRequestQueueQuery, RequestSummaryView[]>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
  ) {}

  async execute(query: ListRequestQueueQuery): Promise<RequestSummaryView[]> {
    const rows = await this.requests.listByStatus(query.status as RequestStatus)
    return [...rows].sort(Request.compareForQueue).map(toRequestSummary)
  }
}
