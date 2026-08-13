import { TemplateCatalogQueryPort } from '../../application/catalog/queries/ports/template-catalog.query';
import { TemplateCatalogView } from '../../application/catalog/queries/views/template-catalog.view';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaTemplateCatalogQuery implements TemplateCatalogQueryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filter?: {
        onlyActive?: boolean;
    }): Promise<TemplateCatalogView[]>;
    findByIdOrCode(idOrCode: string): Promise<TemplateCatalogView | null>;
    private toView;
}
