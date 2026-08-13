import type { AttributeDefinition } from '../../../../domain/catalog/attribute-definition';
import type { AttributeDataType } from '../../../../domain/catalog/enums';
export interface AttributeDefinitionView {
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
}
export declare function toAttributeDefinitionView(definition: AttributeDefinition): AttributeDefinitionView;
