import { RequestAction } from '../../domain/request/request-action';
import { RequestActionRepository } from '../../domain/request/ports/request-action.repository';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaRequestActionRepository implements RequestActionRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get db();
    append(action: RequestAction): Promise<void>;
    listByRequest(requestId: Identifier): Promise<RequestAction[]>;
}
