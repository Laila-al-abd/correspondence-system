import { IQueryHandler } from '@nestjs/cqrs';
import type { DelegationQueryPort, DelegationView } from '../../ports/delegation-query.port';
import { GetDelegationQuery } from './get-delegation.query';
export declare class GetDelegationHandler implements IQueryHandler<GetDelegationQuery, DelegationView> {
    private readonly delegations;
    constructor(delegations: DelegationQueryPort);
    execute({ delegationId }: GetDelegationQuery): Promise<DelegationView>;
}
