import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { RequestQueryPort } from '../../ports/request-query.port'
import { REQUEST_QUERY } from '../../../tokens'
import { KeysetPage } from '../../../shared/pagination'
import { ListAssignedRequestsQuery } from './list-assigned-requests.query'
import { RequestSummaryView } from '../views/request.view'

/** One page of the requests that have at least one step assigned to the caller. */
@QueryHandler(ListAssignedRequestsQuery)
export class ListAssignedRequestsHandler
  implements
    IQueryHandler<ListAssignedRequestsQuery, KeysetPage<RequestSummaryView>>
{
  constructor(
    @Inject(REQUEST_QUERY) private readonly requests: RequestQueryPort,
  ) {}

  execute(
    query: ListAssignedRequestsQuery,
  ): Promise<KeysetPage<RequestSummaryView>> {
    return this.requests.listAssignedTo({
      userId: query.userId,
      limit: query.limit,
      cursor: query.cursor,
    })
  }
}
