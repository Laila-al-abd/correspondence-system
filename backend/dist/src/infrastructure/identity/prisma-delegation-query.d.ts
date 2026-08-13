import type { DelegationQueryPort, DelegationView, ListDelegationsFilter } from '../../application/identity/ports/delegation-query.port';
import { OffsetPage } from '../../application/shared/pagination';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaDelegationQuery implements DelegationQueryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filter: ListDelegationsFilter): Promise<OffsetPage<DelegationView>>;
    getById(id: string): Promise<DelegationView | null>;
}
