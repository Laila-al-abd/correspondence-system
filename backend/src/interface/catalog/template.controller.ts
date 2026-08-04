import { Controller, Get, Param, Query } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { ListTemplateCatalogQuery } from '../../application/catalog/queries/list-template-catalog/list-template-catalog.query'
import { GetTemplateCatalogQuery } from '../../application/catalog/queries/get-template-catalog/get-template-catalog.query'
import { TemplateCatalogView } from '../../application/catalog/queries/views/template-catalog.view'
import { RequireAnyPermission } from '../identity/permissions.decorator'

/**
 * The template catalogue, for staff and for the AI service.
 *
 * Not a public form directory: a student never browses templates, they write a
 * sentence and the classifier picks one. So this is gated -- but to either
 * `template.manage` (the administrator who authors templates) or
 * `request.classify` (the AI service, which needs each template's Arabic
 * document to embed and each field's extraction question to ask). Requiring
 * both would mean handing the AI account authoring rights it must never have.
 *
 * Neither permission is time-restricted here, deliberately: the classifier polls
 * around the clock, and a catalogue read changes nothing.
 */
@Controller('templates')
@RequireAnyPermission('request.classify', 'template.manage')
export class TemplateController {
  constructor(private readonly queryBus: QueryBus) {}

  /**
   * Active templates by default. `?includeInactive=true` also returns retired
   * ones, which authoring needs and the classifier must not use.
   */
  @Get()
  list(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<TemplateCatalogView[]> {
    return this.queryBus.execute(
      new ListTemplateCatalogQuery(includeInactive === 'true'),
    )
  }

  /** One template, by UUID or by its stable code (ENROLL_CERT). */
  @Get(':idOrCode')
  get(@Param('idOrCode') idOrCode: string): Promise<TemplateCatalogView> {
    return this.queryBus.execute(new GetTemplateCatalogQuery(idOrCode))
  }
}
