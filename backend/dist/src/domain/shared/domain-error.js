"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvariantViolationError = exports.RequiredFieldError = exports.DomainError = void 0;
class DomainError extends Error {
    constructor(message) {
        super(message);
        this.name = new.target.name;
    }
}
exports.DomainError = DomainError;
class RequiredFieldError extends DomainError {
    code = "REQUIRED_FIELD";
    constructor(field) { super(`"${field}" is required.`); }
}
exports.RequiredFieldError = RequiredFieldError;
class InvariantViolationError extends DomainError {
    code = "INVARIANT_VIOLATION";
}
exports.InvariantViolationError = InvariantViolationError;
//# sourceMappingURL=domain-error.js.map