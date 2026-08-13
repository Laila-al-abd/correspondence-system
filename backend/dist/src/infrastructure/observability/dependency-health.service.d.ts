import type { ObjectStorage } from '../../domain/shared/object-storage';
import { PrismaService } from '../persistence/prisma.service';
export interface DependencyStatus {
    name: string;
    status: 'up' | 'down';
    latencyMs: number;
    error?: string;
}
export interface HealthReport {
    status: 'ok' | 'degraded';
    checkedAt: string;
    dependencies: DependencyStatus[];
}
export declare class DependencyHealthService {
    private readonly prisma;
    private readonly storage;
    constructor(prisma: PrismaService, storage: ObjectStorage);
    check(): Promise<HealthReport>;
    private probe;
}
