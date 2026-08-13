import type { OpenStepSla, SlaScanPort } from '../../application/observability/ports/sla-scan.port';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaSlaScan implements SlaScanPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findOpenStepsWithDeadline(limit: number): Promise<OpenStepSla[]>;
}
