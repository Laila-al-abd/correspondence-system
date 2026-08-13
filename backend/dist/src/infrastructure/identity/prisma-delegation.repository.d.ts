import { Delegation } from '../../domain/identity/delegation';
import { DelegationRepository } from '../../domain/identity/ports/delegation.repository';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaDelegationRepository implements DelegationRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: Identifier): Promise<Delegation | null>;
    save(delegation: Delegation): Promise<void>;
    activeToDelegate(delegateId: Identifier, on: Date): Promise<Delegation | null>;
    activeFor(delegatorId: Identifier, on: Date): Promise<Delegation | null>;
}
