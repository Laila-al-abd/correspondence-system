import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { RequestQueryPort } from '../../ports/request-query.port'
import { REQUEST_QUERY } from '../../../tokens'
import { KeysetPage } from '../../../shared/pagination'
import { ListMyRequestsQuery } from './list-my-requests.query'
import { RequestSummaryView } from '../views/request.view'

/**
 * One page of the caller's own requests, newest first.
 *
 * Reads through the request read model rather than the repository: this screen
 * needs summary rows, not aggregates, and an applicant with a long history
 * should not cost the server their entire request graph to render a table.
 */
@QueryHandler(ListMyRequestsQuery)
export class ListMyRequestsHandler
  implements IQueryHandler<ListMyRequestsQuery, KeysetPage<RequestSummaryView>>
{
  constructor(
    @Inject(REQUEST_QUERY) private readonly requests: RequestQueryPort,
  ) {}

  execute(query: ListMyRequestsQuery): Promise<KeysetPage<RequestSummaryView>> {
    return this.requests.listByRequester({
      requesterId: query.requesterId,
      limit: query.limit,
      cursor: query.cursor,
    })
  }
}
