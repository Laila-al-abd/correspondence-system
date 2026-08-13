import { ICommandHandler } from '@nestjs/cqrs';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import { ReorderTemplateFieldsCommand } from './reorder-template-fields.command';
export interface ReorderTemplateFieldsResult {
    templateId: string;
    fieldKeys: string[];
}
export declare class ReorderTemplateFieldsHandler implements ICommandHandler<ReorderTemplateFieldsCommand, ReorderTemplateFieldsResult> {
    private readonly templates;
    constructor(templates: TemplateRepository);
    execute({ input, }: ReorderTemplateFieldsCommand): Promise<ReorderTemplateFieldsResult>;
}
