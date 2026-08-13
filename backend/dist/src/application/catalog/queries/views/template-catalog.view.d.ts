import { Priority } from '../../../../domain/request/enums';
export interface TemplateFieldCatalogView {
    key: string;
    labelAr: string;
    labelEn?: string;
    dataType: string;
    isRequired: boolean;
    ordinal: number;
    extractionQuestion?: string;
    options: {
        value: string;
        labelAr: string;
        labelEn?: string;
    }[];
}
export interface TemplateCatalogView {
    id: string;
    code?: string;
    nameAr: string;
    nameEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    classifierDocument?: string;
    categoryId?: string;
    sensitivityLevelId?: string;
    defaultPriority?: Priority;
    isActive: boolean;
    updatedAt: string;
    fields: TemplateFieldCatalogView[];
}
