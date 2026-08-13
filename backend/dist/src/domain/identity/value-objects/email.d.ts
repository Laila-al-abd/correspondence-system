import { ValueObject } from "../../shared/value-object";
import { DomainError } from "../../shared/domain-error";
export declare class InvalidEmailError extends DomainError {
    readonly code = "INVALID_EMAIL";
}
export declare class Email extends ValueObject<{
    value: string;
}> {
    private static RE;
    private constructor();
    static create(raw: string): Email;
    get value(): string;
}
