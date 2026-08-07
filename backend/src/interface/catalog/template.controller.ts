import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ListTemplateCatalogQuery } from '../../application/catalog/queries/list-template-catalog/list-template-catalog.query'
import { GetTemplateCatalogQuery } from '../../application/catalog/queries/get-template-catalog/get-template-catalog.query'
import { TemplateCatalogView } from '../../application/catalog/queries/views/template-catalog.view'
import { CreateTemplateCommand } from '../../application/catalog/commands/create-template/create-template.command'
import type { CreateTemplateResult } from '../../application/catalog/commands/create-template/create-template.handler'
import { UpdateTemplateCommand } from '../../application/catalog/commands/update-template/update-template.command'
import type { UpdateTemplateResult } from '../../application/catalog/commands/update-template/update-template.handler'
import { UpsertTemplateFieldCommand } from '../../application/catalog/commands/upsert-template-field/upsert-template-field.command'
import type { UpsertTemplateFieldResult } from '../../application/catalog/commands/upsert-template-field/upsert-template-field.handler'
import { RemoveTemplateFieldCommand } from '../../application/catalog/commands/remove-template-field/remove-template-field.command'
import type { RemoveTemplateFieldResult } from '../../application/catalog/commands/remove-template-field/remove-template-field.handler'
import { ReorderTemplateFieldsCommand } from '../../application/catalog/commands/reorder-template-fields/reorder-template-fields.command'
import type { ReorderTemplateFieldsResult } from '../../application/catalog/commands/reorder-template-fields/reorder-template-fields.handler'
import { CreateTemplateDto } from './dto/create-template.dto'
import { UpdateTemplateDto } from './dto/update-template.dto'
import {
  ReorderTemplateFieldsDto,
  UpsertTemplateFieldDto,
} from './dto/template-field.dto'
import {
  RequireAnyPermission,
  RequirePermissions,
} from '../identity/permissions.decorator'

/**
 * The template catalogue, for staff and for the AI service.
 *
 * Not a public form directory: a student never browses templates, they write a
 * sentence and the classifier picks one. So this is gated -- but reads are gated
 * to either `template.manage` (the administrator who authors templates) or
 * `request.classify` (the AI service, which needs each template's Arabic
 * document to embed and each field's extraction question to ask). Requiring
 * both would mean handing the AI account authoring rights it must never have.
 *
 * Writes are gated to `template.manage` alone. The two guard checks are
 * independent, so the class-level "either of" still admits the AI account to the
 * reads while the method-level requirement keeps it out of every mutation.
 *
 * Neither permission is time-restricted here, deliberately: the classifier polls
 * around the clock, and a catalogue read changes nothing.
 */
@Controller('templates')
@RequireAnyPermission('request.classify', 'template.manage')
export class TemplateController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  /**
   * Authors a new request type, optionally with its fields in one call.
   *
   * A new template has no workflow path yet, so requests classified onto it
   * cannot be started until one is defined -- which fails loudly rather than
   * stranding anything.
   */
  @Post()
  @RequirePermissions('template.manage')
  create(@Body() dto: CreateTemplateDto): Promise<CreateTemplateResult> {
    return this.commandBus.execute(new CreateTemplateCommand(dto))
  }

  /** Edits a template's own attributes. Fields have their own routes. */
  @Patch(':id')
  @RequirePermissions('template.manage')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ): Promise<UpdateTemplateResult> {
    return this.commandBus.execute(
      new UpdateTemplateCommand({ ...dto, templateId: id }),
    )
  }

  /**
   * Retires a template: it stops being offered and stops being classified
   * against, and everything already submitted under it stays readable.
   *
   * Deliberately not a delete. Requests, workflow paths and prediction rows all
   * refer to a template long after it stops being offered, and a request whose
   * template had vanished could not be validated, confirmed, or explained to the
   * person who submitted it. `PATCH { "isActive": true }` brings one back.
   */
  @Delete(':id')
  @RequirePermissions('template.manage')
  retire(@Param('id') id: string): Promise<UpdateTemplateResult> {
    return this.commandBus.execute(
      new UpdateTemplateCommand({ templateId: id, isActive: false }),
    )
  }

  /**
   * Adds a field, or redefines the field already declared under that key.
   *
   * One route for both, because the author's intent is identical -- "this
   * template should have this field, defined this way". The key itself is never
   * rewritten: stored answers and prediction rows are written against it, so a
   * rename is a remove plus an add, which is visible.
   */
  @Put(':id/fields')
  @RequirePermissions('template.manage')
  upsertField(
    @Param('id') id: string,
    @Body() dto: UpsertTemplateFieldDto,
  ): Promise<UpsertTemplateFieldResult> {
    const { ordinal, ...field } = dto
    return this.commandBus.execute(
      new UpsertTemplateFieldCommand({ templateId: id, field, ordinal }),
    )
  }

  /** Sets the presentation order. Must name every field exactly once. */
  @Post(':id/fields/reorder')
  @RequirePermissions('template.manage')
  reorderFields(
    @Param('id') id: string,
    @Body() dto: ReorderTemplateFieldsDto,
  ): Promise<ReorderTemplateFieldsResult> {
    return this.commandBus.execute(
      new ReorderTemplateFieldsCommand({
        templateId: id,
        fieldKeys: dto.fieldKeys,
      }),
    )
  }

  /**
   * Removes a field from the definition. Answers already stored under the key
   * are left alone, so submitted history stays readable -- but a request of
   * this type still awaiting confirmation now holds a key the template no
   * longer declares, and confirmation will say so.
   */
  @Delete(':id/fields/:fieldKey')
  @RequirePermissions('template.manage')
  removeField(
    @Param('id') id: string,
    @Param('fieldKey') fieldKey: string,
  ): Promise<RemoveTemplateFieldResult> {
    return this.commandBus.execute(
      new RemoveTemplateFieldCommand({ templateId: id, fieldKey }),
    )
  }
}
