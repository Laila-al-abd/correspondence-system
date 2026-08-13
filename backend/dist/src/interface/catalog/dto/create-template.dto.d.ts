import { Priority } from '../../../domain/request/enums';
import { TemplateFieldDto } from './template-field.dto';
export declare class CreateTemplateDto {
    code?: string;
    categoryId?: string;
    sensitivityLevelId?: string;
    titleAr: string;
    titleEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    defaultPriority?: Priority;
    classifierDocument?: string;
    fields?: TemplateFieldDto[];
}
