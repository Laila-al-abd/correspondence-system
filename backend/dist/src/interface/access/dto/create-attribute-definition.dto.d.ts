import { AttributeDataType } from '../../../domain/catalog/enums';
export declare class CreateAttributeOptionDto {
    value: string;
    labelAr: string;
    labelEn?: string;
    ordinal?: number;
}
export declare class CreateAttributeDefinitionDto {
    code: string;
    labelAr: string;
    labelEn?: string;
    dataType: AttributeDataType;
    descriptionAr?: string;
    descriptionEn?: string;
    options?: CreateAttributeOptionDto[];
}
