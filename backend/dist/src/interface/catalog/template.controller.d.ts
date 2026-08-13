import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TemplateCatalogView } from '../../application/catalog/queries/views/template-catalog.view';
import type { CreateTemplateResult } from '../../application/catalog/commands/create-template/create-template.handler';
import type { UpdateTemplateResult } from '../../application/catalog/commands/update-template/update-template.handler';
import type { UpsertTemplateFieldResult } from '../../application/catalog/commands/upsert-template-field/upsert-template-field.handler';
import type { RemoveTemplateFieldResult } from '../../application/catalog/commands/remove-template-field/remove-template-field.handler';
import type { ReorderTemplateFieldsResult } from '../../application/catalog/commands/reorder-template-fields/reorder-template-fields.handler';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { ReorderTemplateFieldsDto, UpsertTemplateFieldDto } from './dto/template-field.dto';
export declare class TemplateController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    list(includeInactive?: string): Promise<TemplateCatalogView[]>;
    get(idOrCode: string): Promise<TemplateCatalogView>;
    create(dto: CreateTemplateDto): Promise<CreateTemplateResult>;
    update(id: string, dto: UpdateTemplateDto): Promise<UpdateTemplateResult>;
    retire(id: string): Promise<UpdateTemplateResult>;
    upsertField(id: string, dto: UpsertTemplateFieldDto): Promise<UpsertTemplateFieldResult>;
    reorderFields(id: string, dto: ReorderTemplateFieldsDto): Promise<ReorderTemplateFieldsResult>;
    removeField(id: string, fieldKey: string): Promise<RemoveTemplateFieldResult>;
}
