import { Entity } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { LocalizedText } from "../shared/localized-text";
import { FieldDataType } from "./enums";
import { TemplateFieldOption } from "./template-field-option";
interface TemplateFieldProps {
    fieldKey: string;
    label: LocalizedText;
    dataType: FieldDataType;
    isRequired: boolean;
    ordinal: number;
    extractionQuestion?: string;
    options?: TemplateFieldOption[];
}
export declare class TemplateField extends Entity {
    private props;
    private constructor();
    static create(id: Identifier, p: TemplateFieldProps): TemplateField;
    redefine(p: Omit<TemplateFieldProps, "fieldKey">): void;
    setOrdinal(ordinal: number): void;
    static rehydrate(id: Identifier, props: TemplateFieldProps): TemplateField;
    get fieldKey(): string;
    get isRequired(): boolean;
    get ordinal(): number;
    get options(): readonly TemplateFieldOption[];
    get extractionQuestion(): string | undefined;
    validate(value: unknown): string | null;
    snapshot(): {
        id: string;
        fieldKey: string;
        label: {
            ar: string;
            en?: string;
        };
        dataType: FieldDataType;
        isRequired: boolean;
        ordinal: number;
        extractionQuestion?: string;
        options: {
            value: string;
            label: {
                ar: string;
                en?: string;
            };
            ordinal: number;
        }[];
    };
}
export {};
