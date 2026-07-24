import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Identifier } from '../../../../domain/shared/identifier'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import { REQUEST_REPOSITORY } from '../../../tokens'
import { ListMyRequestsQuery } from './list-my-requests.query'
import { RequestSummaryView, toRequestSummary } from '../views/request.view'

/** Every request the caller has submitted, newest first. */
@QueryHandler(ListMyRequestsQuery)
export class ListMyRequestsHandler
  implements IQueryHandler<ListMyRequestsQuery, RequestSummaryView[]>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
  ) {}

  async execute(query: ListMyRequestsQuery): Promise<RequestSummaryView[]> {
    const rows = await this.requests.listByRequester(
      Identifier.of(query.requesterId),
    )
    return rows.map(toRequestSummary)
  }
}
