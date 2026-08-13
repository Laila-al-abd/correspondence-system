import { IQueryHandler } from '@nestjs/cqrs';
import type { TemplateCatalogQueryPort } from '../ports/template-catalog.query';
import { TemplateCatalogView } from '../views/template-catalog.view';
import { ListTemplateCatalogQuery } from './list-template-catalog.query';
export declare class ListTemplateCatalogHandler implements IQueryHandler<ListTemplateCatalogQuery, TemplateCatalogView[]> {
    private readonly catalog;
    constructor(catalog: TemplateCatalogQueryPort);
    execute(query: ListTemplateCatalogQuery): Promise<TemplateCatalogView[]>;
}
