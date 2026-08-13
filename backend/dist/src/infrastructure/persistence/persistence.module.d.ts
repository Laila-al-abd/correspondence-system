import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';
export declare class PersistenceModule implements OnModuleInit, OnModuleDestroy {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
