import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { TemplateCatalogQueryPort } from '../ports/template-catalog.query'
import { TemplateCatalogView } from '../views/template-catalog.view'
import { TEMPLATE_CATALOG_QUERY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { GetTemplateCatalogQuery } from './get-template-catalog.query'

/** One template by UUID or by its stable code. */
@QueryHandler(GetTemplateCatalogQuery)
export class GetTemplateCatalogHandler
  implements IQueryHandler<GetTemplateCatalogQuery, TemplateCatalogView>
{
  constructor(
    @Inject(TEMPLATE_CATALOG_QUERY)
    private readonly catalog: TemplateCatalogQueryPort,
  ) {}

  async execute(query: GetTemplateCatalogQuery): Promise<TemplateCatalogView> {
    const view = await this.catalog.findByIdOrCode(query.idOrCode)
    if (!view) throw new EntityNotFoundError('Template', query.idOrCode)
    return view
  }
}
