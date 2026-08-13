import { ValueObject } from "../../shared/value-object";
export declare class PersonName extends ValueObject<{
    ar: string;
    en?: string;
}> {
    private constructor();
    static create(ar: string, en?: string): PersonName;
    get ar(): string;
    get en(): string | undefined;
}
