import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { DelegationView } from '../../application/identity/ports/delegation-query.port';
import { GrantDelegationDto } from './dto/grant-delegation.dto';
import { ListDelegationsDto } from './dto/list-delegations.dto';
import { OffsetPage } from '../../application/shared/pagination';
export declare class DelegationsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    list(dto: ListDelegationsDto): Promise<OffsetPage<DelegationView>>;
    getOne(id: string): Promise<DelegationView>;
    grant(dto: GrantDelegationDto): Promise<DelegationView>;
    revoke(id: string): Promise<DelegationView>;
}
