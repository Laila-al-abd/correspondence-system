import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Identifier } from '../../../../domain/shared/identifier'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import { REQUEST_REPOSITORY } from '../../../tokens'
import { ListAssignedRequestsQuery } from './list-assigned-requests.query'
import { RequestSummaryView, toRequestSummary } from '../views/request.view'

/** Every request that has at least one step assigned to the caller. */
@QueryHandler(ListAssignedRequestsQuery)
export class ListAssignedRequestsHandler
  implements IQueryHandler<ListAssignedRequestsQuery, RequestSummaryView[]>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
  ) {}

  async execute(
    query: ListAssignedRequestsQuery,
  ): Promise<RequestSummaryView[]> {
    const rows = await this.requests.listAssignedTo(Identifier.of(query.userId))
    return rows.map(toRequestSummary)
  }
}
