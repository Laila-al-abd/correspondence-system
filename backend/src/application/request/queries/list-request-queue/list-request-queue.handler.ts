import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { RequestQueryPort } from '../../ports/request-query.port'
import { REQUEST_QUERY } from '../../../tokens'
import { KeysetPage } from '../../../shared/pagination'
import { ListRequestQueueQuery } from './list-request-queue.query'
import { RequestSummaryView } from '../views/request.view'

/**
 * One page of the work queue for a status, ordered the way staff should pick
 * items up: business priority first, then SLA urgency, then the nearest
 * deadline.
 *
 * The sort used to happen here, in memory, over every open request. It now
 * happens in the database, generated from the same rank tables the domain
 * comparator uses. That is what makes the queue pageable at all: you cannot
 * serve page one of an ordering the database does not know, without first
 * fetching every row to sort them yourself.
 */
@QueryHandler(ListRequestQueueQuery)
export class ListRequestQueueHandler
  implements
    IQueryHandler<ListRequestQueueQuery, KeysetPage<RequestSummaryView>>
{
  constructor(
    @Inject(REQUEST_QUERY) private readonly requests: RequestQueryPort,
  ) {}

  execute(
    query: ListRequestQueueQuery,
  ): Promise<KeysetPage<RequestSummaryView>> {
    return this.requests.listQueue({
      status: query.status,
      limit: query.limit,
      cursor: query.cursor,
      classificationStatus: query.classificationStatus,
      hasFilledData: query.hasFilledData,
    })
  }
}
