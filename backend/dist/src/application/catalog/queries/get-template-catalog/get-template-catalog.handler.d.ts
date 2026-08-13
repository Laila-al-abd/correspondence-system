import { IQueryHandler } from '@nestjs/cqrs';
import type { TemplateCatalogQueryPort } from '../ports/template-catalog.query';
import { TemplateCatalogView } from '../views/template-catalog.view';
import { GetTemplateCatalogQuery } from './get-template-catalog.query';
export declare class GetTemplateCatalogHandler implements IQueryHandler<GetTemplateCatalogQuery, TemplateCatalogView> {
    private readonly catalog;
    constructor(catalog: TemplateCatalogQueryPort);
    execute(query: GetTemplateCatalogQuery): Promise<TemplateCatalogView>;
}
