import { ICommandHandler } from '@nestjs/cqrs';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import type { RequestCategoryRepository, SensitivityLevelRepository } from '../../../../domain/catalog/ports/catalog-lookup.repository';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import { CreateTemplateCommand } from './create-template.command';
export interface CreateTemplateResult {
    id: string;
    code?: string;
    fieldCount: number;
}
export declare class CreateTemplateHandler implements ICommandHandler<CreateTemplateCommand, CreateTemplateResult> {
    private readonly templates;
    private readonly categories;
    private readonly sensitivityLevels;
    private readonly ids;
    constructor(templates: TemplateRepository, categories: RequestCategoryRepository, sensitivityLevels: SensitivityLevelRepository, ids: IdGenerator);
    execute({ input }: CreateTemplateCommand): Promise<CreateTemplateResult>;
}
