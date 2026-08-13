import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SlaMonitorService } from '../../application/observability/services/sla-monitor.service';
export declare class SlaMonitorScheduler implements OnModuleInit, OnModuleDestroy {
    private readonly monitor;
    private readonly config;
    private readonly logger;
    private startupTimer?;
    private sweepTimer?;
    private running;
    constructor(monitor: SlaMonitorService, config: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    sweep(): Promise<void>;
    private sweepMinutes;
}
