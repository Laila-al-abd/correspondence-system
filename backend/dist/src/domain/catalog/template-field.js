"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateField = void 0;
const entity_1 = require("../shared/entity");
const guard_1 = require("../shared/guard");
const domain_error_1 = require("../shared/domain-error");
const enums_1 = require("./enums");
class TemplateField extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        guard_1.Guard.againstEmpty(p.fieldKey, "fieldKey");
        return new TemplateField(id, {
            ...p,
            options: assertOptionSet(p.fieldKey, p.dataType, p.options),
        });
    }
    redefine(p) {
        this.props = {
            ...p,
            fieldKey: this.props.fieldKey,
            options: assertOptionSet(this.props.fieldKey, p.dataType, p.options),
        };
    }
    setOrdinal(ordinal) {
        this.props.ordinal = ordinal;
    }
    static rehydrate(id, props) {
        return new TemplateField(id, { ...props, options: props.options ?? [] });
    }
    get fieldKey() { return this.props.fieldKey; }
    get isRequired() { return this.props.isRequired; }
    get ordinal() { return this.props.ordinal; }
    get options() { return this.props.options ?? []; }
    get extractionQuestion() { return this.props.extractionQuestion; }
    validate(value) {
        const empty = value === null || value === undefined || value === "";
        if (empty)
            return this.props.isRequired ? "This field is required." : null;
        switch (this.props.dataType) {
            case enums_1.FieldDataType.NUMBER: {
                const numeric = Number(value);
                if (!Number.isFinite(numeric))
                    return "Expected a number.";
                if (this.props.fieldKey.endsWith("_year") && (numeric < 1900 || numeric > 2100))
                    return "Expected a year between 1900 and 2100.";
                return null;
            }
            case enums_1.FieldDataType.DATE:
                return isCalendarDate(String(value))
                    ? null
                    : "Expected a real calendar date written as YYYY-MM-DD.";
            case enums_1.FieldDataType.BOOLEAN:
                return isBooleanLike(value) ? null : "Expected true or false.";
            case enums_1.FieldDataType.ENUM: {
                const allowed = this.options.map((o) => o.value);
                return allowed.includes(String(value))
                    ? null
                    : `Expected one of: ${allowed.join(", ")}.`;
            }
            case enums_1.FieldDataType.TEXT:
                return String(value).length > 0 ? null : "Expected text.";
            default:
                return null;
        }
    }
    snapshot() {
        return {
            id: this.id.toString(),
            fieldKey: this.props.fieldKey,
            label: this.props.label.toJSON(),
            dataType: this.props.dataType,
            isRequired: this.props.isRequired,
            ordinal: this.props.ordinal,
            extractionQuestion: this.props.extractionQuestion,
            options: (this.props.options ?? []).map((o) => ({
                value: o.value,
                label: o.label.toJSON(),
                ordinal: o.ordinal,
            })),
        };
    }
}
exports.TemplateField = TemplateField;
function assertOptionSet(fieldKey, dataType, options) {
    const set = options ?? [];
    if (dataType === enums_1.FieldDataType.ENUM) {
        if (set.length === 0)
            throw new domain_error_1.InvariantViolationError(`ENUM field "${fieldKey}" must define at least one option.`);
        const values = set.map((o) => o.value);
        if (new Set(values).size !== values.length)
            throw new domain_error_1.InvariantViolationError(`Duplicate option value in field "${fieldKey}".`);
    }
    else if (set.length > 0) {
        throw new domain_error_1.InvariantViolationError(`Only ENUM fields may define options (field "${fieldKey}").`);
    }
    return set;
}
function isCalendarDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match)
        return false;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day);
}
function isBooleanLike(value) {
    if (typeof value === "boolean")
        return true;
    const text = String(value).toLowerCase();
    return text === "true" || text === "false";
}
//# sourceMappingURL=template-field.js.map