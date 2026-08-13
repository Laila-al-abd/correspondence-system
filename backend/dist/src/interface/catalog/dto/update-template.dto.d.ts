import { Priority } from '../../../domain/request/enums';
export declare class UpdateTemplateDto {
    code?: string;
    categoryId?: string;
    sensitivityLevelId?: string;
    titleAr?: string;
    titleEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    defaultPriority?: Priority;
    classifierDocument?: string;
    isActive?: boolean;
}
