"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = exports.InvalidEmailError = void 0;
const value_object_1 = require("../../shared/value-object");
const domain_error_1 = require("../../shared/domain-error");
class InvalidEmailError extends domain_error_1.DomainError {
    code = "INVALID_EMAIL";
}
exports.InvalidEmailError = InvalidEmailError;
class Email extends value_object_1.ValueObject {
    static RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    constructor(value) { super({ value }); }
    static create(raw) {
        const value = raw?.trim().toLowerCase();
        if (!value || !Email.RE.test(value))
            throw new InvalidEmailError(`Invalid email: "${raw}"`);
        return new Email(value);
    }
    get value() { return this.props.value; }
}
exports.Email = Email;
//# sourceMappingURL=email.js.map