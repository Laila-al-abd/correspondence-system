"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberingScheme = void 0;
const value_object_1 = require("../../shared/value-object");
const domain_error_1 = require("../../shared/domain-error");
const DEFAULTS = {
    pattern: "{prefix}-{year}-{seq}",
    prefix: "REQ",
    seqPadding: 5,
    resetPolicy: "YEARLY",
    yearDigits: 4,
};
const RESET_POLICIES = ["YEARLY", "MONTHLY", "NEVER"];
class NumberingScheme extends value_object_1.ValueObject {
    constructor(props) {
        super(props);
    }
    static create(config = {}) {
        const props = {
            pattern: config.pattern?.trim() || DEFAULTS.pattern,
            prefix: config.prefix ?? DEFAULTS.prefix,
            seqPadding: config.seqPadding ?? DEFAULTS.seqPadding,
            resetPolicy: config.resetPolicy ?? DEFAULTS.resetPolicy,
            yearDigits: config.yearDigits ?? DEFAULTS.yearDigits,
        };
        if (!props.pattern.includes("{seq}"))
            throw new domain_error_1.InvariantViolationError('Numbering pattern must contain the "{seq}" token.');
        if (!Number.isInteger(props.seqPadding) || props.seqPadding < 0 || props.seqPadding > 12)
            throw new domain_error_1.InvariantViolationError("Sequence padding must be an integer between 0 and 12.");
        if (props.yearDigits !== 2 && props.yearDigits !== 4)
            throw new domain_error_1.InvariantViolationError("Year digits must be 2 or 4.");
        if (!RESET_POLICIES.includes(props.resetPolicy))
            throw new domain_error_1.InvariantViolationError(`Unknown reset policy "${props.resetPolicy}".`);
        return new NumberingScheme(props);
    }
    scopeFor(date) {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        switch (this.props.resetPolicy) {
            case "NEVER":
                return "GLOBAL";
            case "MONTHLY":
                return `${year}-${this.pad(month, 2)}`;
            case "YEARLY":
            default:
                return String(year);
        }
    }
    format(sequence, date) {
        const year = date.getUTCFullYear();
        const yearToken = this.props.yearDigits === 2 ? this.pad(year % 100, 2) : String(year);
        return this.props.pattern
            .replace(/\{prefix\}/g, this.props.prefix)
            .replace(/\{year\}/g, yearToken)
            .replace(/\{month\}/g, this.pad(date.getUTCMonth() + 1, 2))
            .replace(/\{seq\}/g, this.pad(sequence, this.props.seqPadding));
    }
    pad(value, width) {
        return String(value).padStart(width, "0");
    }
    get pattern() {
        return this.props.pattern;
    }
    get resetPolicy() {
        return this.props.resetPolicy;
    }
}
exports.NumberingScheme = NumberingScheme;
//# sourceMappingURL=numbering-scheme.js.map