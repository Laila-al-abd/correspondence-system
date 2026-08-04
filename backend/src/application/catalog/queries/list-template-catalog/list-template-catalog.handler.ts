import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { TemplateCatalogQueryPort } from '../ports/template-catalog.query'
import { TemplateCatalogView } from '../views/template-catalog.view'
import { TEMPLATE_CATALOG_QUERY } from '../../../tokens'
import { ListTemplateCatalogQuery } from './list-template-catalog.query'

/** The whole catalogue, including what the AI service needs to classify and extract. */
@QueryHandler(ListTemplateCatalogQuery)
export class ListTemplateCatalogHandler
  implements IQueryHandler<ListTemplateCatalogQuery, TemplateCatalogView[]>
{
  constructor(
    @Inject(TEMPLATE_CATALOG_QUERY)
    private readonly catalog: TemplateCatalogQueryPort,
  ) {}

  execute(query: ListTemplateCatalogQuery): Promise<TemplateCatalogView[]> {
    return this.catalog.list({ onlyActive: !query.includeInactive })
  }
}
