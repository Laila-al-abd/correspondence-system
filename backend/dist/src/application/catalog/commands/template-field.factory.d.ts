import { TemplateField } from '../../../domain/catalog/template-field';
import { TemplateFieldOption } from '../../../domain/catalog/template-field-option';
import { FieldDataType } from '../../../domain/catalog/enums';
import { Identifier } from '../../../domain/shared/identifier';
import { LocalizedText } from '../../../domain/shared/localized-text';
export interface TemplateFieldOptionInput {
    value: string;
    labelAr: string;
    labelEn?: string;
}
export interface TemplateFieldInput {
    key: string;
    labelAr: string;
    labelEn?: string;
    dataType: FieldDataType;
    isRequired?: boolean;
    extractionQuestion?: string;
    options?: TemplateFieldOptionInput[];
}
export declare function templateFieldProps(input: TemplateFieldInput, ordinal: number): {
    fieldKey: string;
    label: LocalizedText;
    dataType: FieldDataType;
    isRequired: boolean;
    ordinal: number;
    extractionQuestion: string | undefined;
    options: TemplateFieldOption[];
};
export declare function buildTemplateField(id: Identifier, input: TemplateFieldInput, ordinal: number): TemplateField;
