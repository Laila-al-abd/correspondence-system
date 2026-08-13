import { TransactionRunner } from '../../domain/shared/transaction-runner';
import { PrismaService } from './prisma.service';
export declare class PrismaTransactionRunner implements TransactionRunner {
    private readonly prisma;
    constructor(prisma: PrismaService);
    run<T>(work: () => Promise<T>): Promise<T>;
}
