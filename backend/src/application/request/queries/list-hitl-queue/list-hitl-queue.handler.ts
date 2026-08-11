import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { RequestQueryPort } from '../../ports/request-query.port'
import { REQUEST_QUERY } from '../../../tokens'
import { KeysetPage } from '../../../shared/pagination'
import { ListHitlQueueQuery } from './list-hitl-queue.query'
import { RequestSummaryView } from '../views/request.view'

/**
 * The classification reviewer's inbox: DRAFT requests that are either
 * PENDING classification or already marked HITL. The filter is hardcoded
 * server-side so a caller cannot override it -- this is not a general
 * queue endpoint with a different default, it is a dedicated route for
 * the classification role.
 */
@QueryHandler(ListHitlQueueQuery)
export class ListHitlQueueHandler
  implements IQueryHandler<ListHitlQueueQuery, KeysetPage<RequestSummaryView>>
{
  constructor(
    @Inject(REQUEST_QUERY) private readonly requests: RequestQueryPort,
  ) {}

  execute(
    query: ListHitlQueueQuery,
  ): Promise<KeysetPage<RequestSummaryView>> {
    return this.requests.listQueue({
      status: ListHitlQueueQuery.status,
      limit: query.limit,
      cursor: query.cursor,
      classificationStatus: [...ListHitlQueueQuery.classificationStatus],
    })
  }
}