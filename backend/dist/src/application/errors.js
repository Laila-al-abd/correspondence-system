"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcurrentModificationError = exports.RequestNotExtractableError = exports.TemplateCodeAlreadyInUseError = exports.FilledDataInvalidError = exports.NotEligibleError = exports.UpstreamUnavailableError = exports.ForbiddenActionError = exports.EntityNotFoundError = exports.LanguageAlreadyExistsError = exports.UnsupportedAuthMethodError = exports.InvalidTokenError = exports.InvalidCredentialsError = exports.InstitutionalNumberAlreadyInUseError = exports.EmailAlreadyInUseError = exports.ApplicationError = void 0;
class ApplicationError extends Error {
    constructor(message) {
        super(message);
        this.name = new.target.name;
    }
}
exports.ApplicationError = ApplicationError;
class EmailAlreadyInUseError extends ApplicationError {
    code = 'EMAIL_IN_USE';
    status = 409;
    constructor(email) {
        super(`Email already in use: ${email}`);
    }
}
exports.EmailAlreadyInUseError = EmailAlreadyInUseError;
class InstitutionalNumberAlreadyInUseError extends ApplicationError {
    code = 'INSTITUTIONAL_NUMBER_IN_USE';
    status = 409;
    constructor(value) {
        super(`Institutional number already in use: ${value}`);
    }
}
exports.InstitutionalNumberAlreadyInUseError = InstitutionalNumberAlreadyInUseError;
class InvalidCredentialsError extends ApplicationError {
    code = 'INVALID_CREDENTIALS';
    status = 401;
    constructor() {
        super('Invalid credentials.');
    }
}
exports.InvalidCredentialsError = InvalidCredentialsError;
class InvalidTokenError extends ApplicationError {
    code = 'INVALID_TOKEN';
    status = 401;
    constructor(message = 'Invalid or expired access token.') {
        super(message);
    }
}
exports.InvalidTokenError = InvalidTokenError;
class UnsupportedAuthMethodError extends ApplicationError {
    code = 'UNSUPPORTED_AUTH_METHOD';
    status = 400;
    constructor(key) {
        super(`Unsupported authentication method: ${key}`);
    }
}
exports.UnsupportedAuthMethodError = UnsupportedAuthMethodError;
class LanguageAlreadyExistsError extends ApplicationError {
    code = 'LANGUAGE_EXISTS';
    status = 409;
    constructor(codeValue) {
        super(`Language already exists: ${codeValue}`);
    }
}
exports.LanguageAlreadyExistsError = LanguageAlreadyExistsError;
class EntityNotFoundError extends ApplicationError {
    code = 'NOT_FOUND';
    status = 404;
    constructor(entity, id) {
        super(id ? `${entity} not found: ${id}` : `${entity} not found.`);
    }
}
exports.EntityNotFoundError = EntityNotFoundError;
class ForbiddenActionError extends ApplicationError {
    code = 'FORBIDDEN';
    status = 403;
    constructor(message = 'You are not allowed to perform this action.') {
        super(message);
    }
}
exports.ForbiddenActionError = ForbiddenActionError;
class UpstreamUnavailableError extends ApplicationError {
    code = 'UPSTREAM_UNAVAILABLE';
    status = 502;
    constructor(message = 'An upstream service is currently unavailable.') {
        super(message);
    }
}
exports.UpstreamUnavailableError = UpstreamUnavailableError;
class NotEligibleError extends ApplicationError {
    unmetRules;
    code = 'NOT_ELIGIBLE';
    status = 403;
    constructor(unmetRules) {
        super(`You do not meet the requirements for this request type: ${unmetRules
            .map((rule) => rule.attributeCode ?? 'an unnamed attribute')
            .join(', ')}`);
        this.unmetRules = unmetRules;
    }
}
exports.NotEligibleError = NotEligibleError;
class FilledDataInvalidError extends ApplicationError {
    violations;
    code = 'FILLED_DATA_INVALID';
    status = 400;
    constructor(violations) {
        super(`The submitted form data does not match the template: ${violations
            .map((violation) => `${violation.fieldKey} -- ${violation.reason}`)
            .join('; ')}`);
        this.violations = violations;
    }
}
exports.FilledDataInvalidError = FilledDataInvalidError;
class TemplateCodeAlreadyInUseError extends ApplicationError {
    templateCode;
    code = 'TEMPLATE_CODE_ALREADY_IN_USE';
    status = 409;
    constructor(templateCode) {
        super(`Template code ${templateCode} already belongs to another template. ` +
            'Codes are how the AI service and every stored measurement refer to a ' +
            'template, so they cannot be shared or reused.');
        this.templateCode = templateCode;
    }
}
exports.TemplateCodeAlreadyInUseError = TemplateCodeAlreadyInUseError;
class RequestNotExtractableError extends ApplicationError {
    requestId;
    reason;
    code = 'REQUEST_NOT_EXTRACTABLE';
    status = 409;
    constructor(requestId, reason) {
        super(`Extracted values were not accepted for request ${requestId}: ${reason}`);
        this.requestId = requestId;
        this.reason = reason;
    }
}
exports.RequestNotExtractableError = RequestNotExtractableError;
class ConcurrentModificationError extends ApplicationError {
    entity;
    entityId;
    code = 'CONCURRENT_MODIFICATION';
    status = 409;
    constructor(entity, entityId) {
        super(`This ${entity} was changed by someone else while you were working on it. ` +
            'Reload it and try your action again.');
        this.entity = entity;
        this.entityId = entityId;
    }
}
exports.ConcurrentModificationError = ConcurrentModificationError;
//# sourceMappingURL=errors.js.map