import { ICommandHandler } from '@nestjs/cqrs';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import type { RequestCategoryRepository, SensitivityLevelRepository } from '../../../../domain/catalog/ports/catalog-lookup.repository';
import { UpdateTemplateCommand } from './update-template.command';
export interface UpdateTemplateResult {
    id: string;
    code?: string;
    isActive: boolean;
}
export declare class UpdateTemplateHandler implements ICommandHandler<UpdateTemplateCommand, UpdateTemplateResult> {
    private readonly templates;
    private readonly categories;
    private readonly sensitivityLevels;
    constructor(templates: TemplateRepository, categories: RequestCategoryRepository, sensitivityLevels: SensitivityLevelRepository);
    execute({ input }: UpdateTemplateCommand): Promise<UpdateTemplateResult>;
}
