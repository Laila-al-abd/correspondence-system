import { ICommandHandler } from '@nestjs/cqrs';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import { RemoveTemplateFieldCommand } from './remove-template-field.command';
export interface RemoveTemplateFieldResult {
    templateId: string;
    fieldKey: string;
    remainingFields: number;
}
export declare class RemoveTemplateFieldHandler implements ICommandHandler<RemoveTemplateFieldCommand, RemoveTemplateFieldResult> {
    private readonly templates;
    constructor(templates: TemplateRepository);
    execute({ input, }: RemoveTemplateFieldCommand): Promise<RemoveTemplateFieldResult>;
}
