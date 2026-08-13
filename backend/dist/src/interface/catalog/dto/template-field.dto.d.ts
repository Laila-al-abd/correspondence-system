import { FieldDataType } from '../../../domain/catalog/enums';
export declare class TemplateFieldOptionDto {
    value: string;
    labelAr: string;
    labelEn?: string;
}
export declare class TemplateFieldDto {
    key: string;
    labelAr: string;
    labelEn?: string;
    dataType: FieldDataType;
    isRequired?: boolean;
    extractionQuestion?: string;
    options?: TemplateFieldOptionDto[];
}
export declare class UpsertTemplateFieldDto extends TemplateFieldDto {
    ordinal?: number;
}
export declare class ReorderTemplateFieldsDto {
    fieldKeys: string[];
}
