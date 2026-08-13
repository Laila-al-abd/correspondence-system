import { Request } from '../../domain/request/request';
import { RequestRepository } from '../../domain/request/ports/request.repository';
import { RequestStatus } from '../../domain/request/enums';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
import { PrismaTransactionRunner } from '../persistence/prisma-transaction-runner';
export declare class PrismaRequestRepository implements RequestRepository {
    private readonly prisma;
    private readonly transactions;
    constructor(prisma: PrismaService, transactions: PrismaTransactionRunner);
    private get db();
    findById(id: Identifier): Promise<Request | null>;
    findByReferenceNo(referenceNo: string): Promise<Request | null>;
    listByRequester(requesterId: Identifier): Promise<Request[]>;
    listAssignedTo(userId: Identifier): Promise<Request[]>;
    listByStatus(status: RequestStatus): Promise<Request[]>;
    save(request: Request): Promise<void>;
}
