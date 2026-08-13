import { Language } from '../../domain/catalog/language';
import { LanguageRepository } from '../../domain/catalog/ports/language.repository';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaLanguageRepository implements LanguageRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByCode(code: string): Promise<Language | null>;
    list(): Promise<Language[]>;
    save(language: Language): Promise<void>;
}
