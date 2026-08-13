import { Entity } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { LocalizedText } from "../shared/localized-text";
import { AttributeDataType } from "./enums";
import { AttributeOption } from "./attribute-option";
interface AttributeDefinitionProps {
    code: string;
    label: LocalizedText;
    dataType: AttributeDataType;
    description?: LocalizedText;
    options?: AttributeOption[];
}
export declare class AttributeDefinition extends Entity {
    private props;
    private constructor();
    static create(id: Identifier, p: AttributeDefinitionProps): AttributeDefinition;
    static rehydrate(id: Identifier, props: AttributeDefinitionProps): AttributeDefinition;
    get code(): string;
    get dataType(): AttributeDataType;
    get options(): readonly AttributeOption[];
    validate(value: unknown): string | null;
    snapshot(): {
        id: string;
        code: string;
        label: {
            ar: string;
            en?: string;
        };
        dataType: AttributeDataType;
        description?: {
            ar: string;
            en?: string;
        };
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
