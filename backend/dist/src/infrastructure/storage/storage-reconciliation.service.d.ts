import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { DocumentRepository } from '../../domain/request/ports/document.repository';
import type { ObjectStorage } from '../../domain/shared/object-storage';
export interface OrphanSample {
    key: string;
    size: number;
    lastModified: string;
}
export interface ReconciliationReport {
    startedAt: string;
    finishedAt: string;
    examined: number;
    withinGrace: number;
    orphans: number;
    orphanBytes: number;
    sample: OrphanSample[];
    truncated: boolean;
}
export declare class StorageReconciliationService implements OnModuleInit, OnModuleDestroy {
    private readonly storage;
    private readonly documents;
    private readonly config;
    private readonly logger;
    private startupTimer?;
    private sweepTimer?;
    private running;
    constructor(storage: ObjectStorage, documents: DocumentRepository, config: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private safeSweep;
    sweep(): Promise<ReconciliationReport>;
    private graceHours;
    private readPositiveNumber;
}
