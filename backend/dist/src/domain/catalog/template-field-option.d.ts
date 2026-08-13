import { ValueObject } from "../shared/value-object";
import { LocalizedText } from "../shared/localized-text";
export declare class TemplateFieldOption extends ValueObject<{
    value: string;
    label: LocalizedText;
    ordinal: number;
}> {
    private constructor();
    static create(value: string, label: LocalizedText, ordinal?: number): TemplateFieldOption;
    get value(): string;
    get label(): LocalizedText;
    get ordinal(): number;
}
