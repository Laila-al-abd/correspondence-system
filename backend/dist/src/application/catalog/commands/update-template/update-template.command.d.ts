import type { Priority } from '../../../../domain/request/enums';
export interface UpdateTemplateInput {
    templateId: string;
    code?: string;
    categoryId?: string;
    sensitivityLevelId?: string;
    titleAr?: string;
    titleEn?: string;
    descriptionAr?: string | null;
    descriptionEn?: string;
    defaultPriority?: Priority;
    classifierDocument?: string | null;
    isActive?: boolean;
}
export declare class UpdateTemplateCommand {
    readonly input: UpdateTemplateInput;
    constructor(input: UpdateTemplateInput);
}
