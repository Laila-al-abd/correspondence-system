import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type {
  DelegationQueryPort,
  DelegationView,
} from '../../ports/delegation-query.port'
import { DELEGATION_QUERY } from '../../../tokens'
import { ListDelegationsQuery } from './list-delegations.query'

@QueryHandler(ListDelegationsQuery)
export class ListDelegationsHandler
  implements IQueryHandler<ListDelegationsQuery, DelegationView[]>
{
  constructor(
    @Inject(DELEGATION_QUERY)
    private readonly delegations: DelegationQueryPort,
  ) {}

  execute({ filter }: ListDelegationsQuery): Promise<DelegationView[]> {
    return this.delegations.list(filter)
  }
}
