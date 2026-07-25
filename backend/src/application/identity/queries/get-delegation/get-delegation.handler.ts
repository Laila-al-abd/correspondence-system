import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type {
  DelegationQueryPort,
  DelegationView,
} from '../../ports/delegation-query.port'
import { DELEGATION_QUERY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { GetDelegationQuery } from './get-delegation.query'

@QueryHandler(GetDelegationQuery)
export class GetDelegationHandler
  implements IQueryHandler<GetDelegationQuery, DelegationView>
{
  constructor(
    @Inject(DELEGATION_QUERY)
    private readonly delegations: DelegationQueryPort,
  ) {}

  async execute({ delegationId }: GetDelegationQuery): Promise<DelegationView> {
    const view = await this.delegations.getById(delegationId)
    if (!view) throw new EntityNotFoundError('Delegation', delegationId)
    return view
  }
}
