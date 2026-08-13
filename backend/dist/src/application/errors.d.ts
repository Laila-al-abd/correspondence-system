export declare abstract class ApplicationError extends Error {
    abstract readonly code: string;
    abstract readonly status: number;
    constructor(message: string);
}
export declare class EmailAlreadyInUseError extends ApplicationError {
    readonly code = "EMAIL_IN_USE";
    readonly status = 409;
    constructor(email: string);
}
export declare class InstitutionalNumberAlreadyInUseError extends ApplicationError {
    readonly code = "INSTITUTIONAL_NUMBER_IN_USE";
    readonly status = 409;
    constructor(value: string);
}
export declare class InvalidCredentialsError extends ApplicationError {
    readonly code = "INVALID_CREDENTIALS";
    readonly status = 401;
    constructor();
}
export declare class InvalidTokenError extends ApplicationError {
    readonly code = "INVALID_TOKEN";
    readonly status = 401;
    constructor(message?: string);
}
export declare class UnsupportedAuthMethodError extends ApplicationError {
    readonly code = "UNSUPPORTED_AUTH_METHOD";
    readonly status = 400;
    constructor(key: string);
}
export declare class LanguageAlreadyExistsError extends ApplicationError {
    readonly code = "LANGUAGE_EXISTS";
    readonly status = 409;
    constructor(codeValue: string);
}
export declare class EntityNotFoundError extends ApplicationError {
    readonly code = "NOT_FOUND";
    readonly status = 404;
    constructor(entity: string, id?: string);
}
export declare class ForbiddenActionError extends ApplicationError {
    readonly code = "FORBIDDEN";
    readonly status = 403;
    constructor(message?: string);
}
export declare class UpstreamUnavailableError extends ApplicationError {
    readonly code = "UPSTREAM_UNAVAILABLE";
    readonly status = 502;
    constructor(message?: string);
}
export declare class NotEligibleError extends ApplicationError {
    readonly unmetRules: Array<{
        attributeCode?: string;
        operator: string;
        value: unknown;
    }>;
    readonly code = "NOT_ELIGIBLE";
    readonly status = 403;
    constructor(unmetRules: Array<{
        attributeCode?: string;
        operator: string;
        value: unknown;
    }>);
}
export declare class FilledDataInvalidError extends ApplicationError {
    readonly violations: Array<{
        fieldKey: string;
        reason: string;
    }>;
    readonly code = "FILLED_DATA_INVALID";
    readonly status = 400;
    constructor(violations: Array<{
        fieldKey: string;
        reason: string;
    }>);
}
export declare class TemplateCodeAlreadyInUseError extends ApplicationError {
    readonly templateCode: string;
    readonly code = "TEMPLATE_CODE_ALREADY_IN_USE";
    readonly status = 409;
    constructor(templateCode: string);
}
export declare class RequestNotExtractableError extends ApplicationError {
    readonly requestId: string;
    readonly reason: string;
    readonly code = "REQUEST_NOT_EXTRACTABLE";
    readonly status = 409;
    constructor(requestId: string, reason: string);
}
export declare class ConcurrentModificationError extends ApplicationError {
    readonly entity: string;
    readonly entityId: string;
    readonly code = "CONCURRENT_MODIFICATION";
    readonly status = 409;
    constructor(entity: string, entityId: string);
}
