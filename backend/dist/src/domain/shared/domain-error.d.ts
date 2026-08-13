export declare abstract class DomainError extends Error {
    abstract readonly code: string;
    constructor(message: string);
}
export declare class RequiredFieldError extends DomainError {
    readonly code = "REQUIRED_FIELD";
    constructor(field: string);
}
export declare class InvariantViolationError extends DomainError {
    readonly code = "INVARIANT_VIOLATION";
}
