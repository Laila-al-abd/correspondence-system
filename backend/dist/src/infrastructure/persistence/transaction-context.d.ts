import { Prisma } from '../../../generated/prisma/client';
export type DbClient = Prisma.TransactionClient;
export declare const TransactionContext: {
    run<T>(client: DbClient, callback: () => Promise<T>): Promise<T>;
    client(): DbClient | undefined;
    isActive(): boolean;
};
export declare function dbClient(fallback: DbClient): DbClient;
