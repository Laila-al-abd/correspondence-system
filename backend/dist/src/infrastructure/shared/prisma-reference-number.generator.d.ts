import { ReferenceNumberGenerator } from '../../domain/request/ports/reference-number-generator';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaReferenceNumberGenerator implements ReferenceNumberGenerator {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get db();
    next(at?: Date): Promise<string>;
    private loadScheme;
    private reserve;
}
