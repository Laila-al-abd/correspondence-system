import { Entity } from '../shared/entity';
import { Identifier } from '../shared/identifier';
import { LocalizedText } from '../shared/localized-text';
interface AttributeOptionProps {
    value: string;
    label: LocalizedText;
    ordinal: number;
}
export declare class AttributeOption extends Entity {
    private props;
    private constructor();
    static create(id: Identifier, p: AttributeOptionProps): AttributeOption;
    static rehydrate(id: Identifier, props: AttributeOptionProps): AttributeOption;
    get value(): string;
    get label(): LocalizedText;
    get ordinal(): number;
}
export {};
