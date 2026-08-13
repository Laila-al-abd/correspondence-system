import { Identifier } from "../../shared/identifier";
import { UserAttribute } from "../user-attribute";
export interface UserAttributeRepository {
    listForUser(userId: Identifier): Promise<UserAttribute[]>;
    setValue(params: {
        userId: Identifier;
        attributeId: Identifier;
        value: unknown;
    }): Promise<void>;
    clear(params: {
        userId: Identifier;
        attributeId: Identifier;
    }): Promise<void>;
}
