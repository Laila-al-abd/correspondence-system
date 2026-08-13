import { ValueObject } from "../../shared/value-object";
export declare class InstitutionalNumber extends ValueObject<{
    value: string;
}> {
    private constructor();
    static create(raw: string): InstitutionalNumber;
    get value(): string;
}
