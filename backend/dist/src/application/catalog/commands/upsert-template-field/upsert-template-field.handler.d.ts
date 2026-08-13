import { ICommandHandler } from '@nestjs/cqrs';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import { UpsertTemplateFieldCommand } from './upsert-template-field.command';
export interface UpsertTemplateFieldResult {
    templateId: string;
    fieldKey: string;
    created: boolean;
    ordinal: number;
}
export declare class UpsertTemplateFieldHandler implements ICommandHandler<UpsertTemplateFieldCommand, UpsertTemplateFieldResult> {
    private readonly templates;
    private readonly ids;
    constructor(templates: TemplateRepository, ids: IdGenerator);
    execute({ input, }: UpsertTemplateFieldCommand): Promise<UpsertTemplateFieldResult>;
}
