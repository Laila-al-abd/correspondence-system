import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
export declare class NotificationRetentionService implements OnModuleInit, OnModuleDestroy {
    private readonly commandBus;
    private readonly config;
    private readonly logger;
    private startupTimer?;
    private sweepTimer?;
    constructor(commandBus: CommandBus, config: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    sweep(): Promise<void>;
    private retentionDays;
    private readPositiveNumber;
}
