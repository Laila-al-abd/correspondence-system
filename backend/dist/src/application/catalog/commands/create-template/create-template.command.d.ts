import type { Priority } from '../../../../domain/request/enums';
import type { TemplateFieldInput } from '../template-field.factory';
export interface CreateTemplateInput {
    code?: string;
    categoryId?: string;
    sensitivityLevelId?: string;
    titleAr: string;
    titleEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    defaultPriority?: Priority;
    classifierDocument?: string;
    fields?: TemplateFieldInput[];
}
export declare class CreateTemplateCommand {
    readonly input: CreateTemplateInput;
    constructor(input: CreateTemplateInput);
}
