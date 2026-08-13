import { IQueryHandler } from '@nestjs/cqrs';
import type { DelegationQueryPort, DelegationView } from '../../ports/delegation-query.port';
import { OffsetPage } from '../../../shared/pagination';
import { ListDelegationsQuery } from './list-delegations.query';
export declare class ListDelegationsHandler implements IQueryHandler<ListDelegationsQuery, OffsetPage<DelegationView>> {
    private readonly delegations;
    constructor(delegations: DelegationQueryPort);
    execute({ filter, }: ListDelegationsQuery): Promise<OffsetPage<DelegationView>>;
}
