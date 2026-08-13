import { Entity } from "../shared/entity";
import { Identifier } from "../shared/identifier";
interface UserAttributeProps {
    userId: Identifier;
    attributeId: Identifier;
    value: unknown;
}
export declare class UserAttribute extends Entity {
    private props;
    private constructor();
    static create(id: Identifier, p: UserAttributeProps): UserAttribute;
    static rehydrate(id: Identifier, props: UserAttributeProps): UserAttribute;
    get userId(): Identifier;
    get attributeId(): Identifier;
    get value(): unknown;
    snapshot(): {
        id: string;
        userId: string;
        attributeId: string;
        value: unknown;
    };
}
export {};
