import { Template } from '../../domain/catalog/template';
import { TemplateRepository } from '../../domain/catalog/ports/template.repository';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaTemplateRepository implements TemplateRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: Identifier): Promise<Template | null>;
    findByCode(code: string): Promise<Template | null>;
    listActive(): Promise<Template[]>;
    listByCategory(categoryId: Identifier): Promise<Template[]>;
    save(template: Template): Promise<void>;
}
