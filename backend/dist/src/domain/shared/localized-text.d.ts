import { ValueObject } from "./value-object";
export declare class LocalizedText extends ValueObject<{
    ar: string;
    en?: string;
}> {
    private constructor();
    static create(ar: string, en?: string): LocalizedText;
    get ar(): string;
    get en(): string;
    toJSON(): {
        ar: string;
        en?: string;
    };
}
