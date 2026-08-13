import { ValueObject } from "../../shared/value-object";
export declare class ExternalRef extends ValueObject<{
    id: string;
    source: string;
}> {
    private constructor();
    static create(id: string, source: string): ExternalRef;
    get id(): string;
    get source(): string;
}
