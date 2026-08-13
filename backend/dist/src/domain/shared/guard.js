"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Guard = void 0;
const domain_error_1 = require("./domain-error");
exports.Guard = {
    againstEmpty(value, field) {
        if (!value || value.trim().length === 0)
            throw new domain_error_1.RequiredFieldError(field);
        return value.trim();
    },
    oneOf(value, allowed, field) {
        if (!allowed.includes(value))
            throw new domain_error_1.RequiredFieldError(`${field} (must be one of ${allowed.join(", ")})`);
        return value;
    },
};
//# sourceMappingURL=guard.js.map