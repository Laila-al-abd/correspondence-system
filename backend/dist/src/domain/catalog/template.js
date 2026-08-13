"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
const entity_1 = require("../shared/entity");
const domain_error_1 = require("../shared/domain-error");
const enums_1 = require("../request/enums");
class Template extends entity_1.AggregateRoot {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        return new Template(id, {
            code: p.code ? Template.normaliseCode(p.code) : undefined,
            classifierDocument: p.classifierDocument,
            categoryId: p.categoryId,
            title: p.title,
            description: p.description,
            sensitivityLevelId: p.sensitivityLevelId,
            defaultPriority: p.defaultPriority ?? enums_1.Priority.NORMAL,
            isActive: true,
            fields: [],
            eligibilityRules: [],
        });
    }
    static rehydrate(id, props) {
        return new Template(id, props);
    }
    addField(field) {
        if (this.props.fields.some((f) => f.fieldKey === field.fieldKey))
            throw new domain_error_1.InvariantViolationError(`Duplicate field key "${field.fieldKey}" in template.`);
        this.props.fields.push(field);
    }
    field(fieldKey) {
        return this.props.fields.find((f) => f.fieldKey === fieldKey);
    }
    nextOrdinal() {
        return this.props.fields.reduce((max, f) => Math.max(max, f.ordinal), 0) + 1;
    }
    removeField(fieldKey) {
        const before = this.props.fields.length;
        this.props.fields = this.props.fields.filter((f) => f.fieldKey !== fieldKey);
        if (this.props.fields.length === before)
            throw new domain_error_1.InvariantViolationError(`Field "${fieldKey}" not found in template.`);
    }
    reorderFields(fieldKeys) {
        const named = new Set(fieldKeys);
        if (named.size !== fieldKeys.length)
            throw new domain_error_1.InvariantViolationError("A field order cannot name the same field twice.");
        const declared = this.props.fields.map((f) => f.fieldKey);
        if (named.size !== declared.length || !declared.every((key) => named.has(key)))
            throw new domain_error_1.InvariantViolationError(`A field order must name every field in this template exactly once: ${declared.join(", ")}.`);
        fieldKeys.forEach((key, index) => {
            this.props.fields.find((f) => f.fieldKey === key)?.setOrdinal(index + 1);
        });
        this.props.fields.sort((a, b) => a.ordinal - b.ordinal);
    }
    setText(title, description) {
        this.props.title = title;
        this.props.description = description;
    }
    setCategory(categoryId) {
        this.props.categoryId = categoryId;
    }
    setSensitivityLevel(sensitivityLevelId) {
        this.props.sensitivityLevelId = sensitivityLevelId;
    }
    addEligibilityRule(rule) {
        if (this.props.eligibilityRules.some((r) => r.attributeId.equals(rule.attributeId)))
            throw new domain_error_1.InvariantViolationError(`Duplicate attribute key "${rule.attributeId}" in template.`);
        this.props.eligibilityRules.push(rule);
    }
    removeEligibilityRule(ruleId) {
        const before = this.props.eligibilityRules.length;
        this.props.eligibilityRules = this.props.eligibilityRules.filter((r) => r.id.toString() !== ruleId.toString());
        if (this.props.eligibilityRules.length === before)
            throw new domain_error_1.InvariantViolationError(`Eligibility rule "${ruleId.toString()}" not found in template.`);
    }
    assignCode(code) {
        const next = Template.normaliseCode(code);
        if (this.props.code && this.props.code !== next)
            throw new domain_error_1.InvariantViolationError(`Template code "${this.props.code}" cannot be changed once assigned.`);
        this.props.code = next;
    }
    setClassifierDocument(document) {
        const trimmed = document?.trim();
        this.props.classifierDocument = trimmed ? trimmed : undefined;
    }
    static normaliseCode(code) {
        const next = code.trim().toUpperCase();
        if (!/^[A-Z][A-Z0-9_]{1,49}$/.test(next))
            throw new domain_error_1.InvariantViolationError(`Template code "${code}" must be 2-50 characters of A-Z, 0-9 and underscore, starting with a letter.`);
        return next;
    }
    get code() { return this.props.code; }
    get classifierDocument() { return this.props.classifierDocument; }
    activate() { this.props.isActive = true; }
    deactivate() { this.props.isActive = false; }
    get isActive() { return this.props.isActive; }
    get categoryId() { return this.props.categoryId; }
    get sensitivityLevelId() { return this.props.sensitivityLevelId; }
    get defaultPriority() { return this.props.defaultPriority; }
    setDefaultPriority(priority) {
        this.props.defaultPriority = priority;
    }
    get fields() { return this.props.fields; }
    unknownKeys(keys) {
        const declared = new Set(this.props.fields.map((f) => f.fieldKey));
        const unknown = [];
        for (const key of keys) {
            if (!declared.has(key) && !unknown.includes(key))
                unknown.push(key);
        }
        return unknown;
    }
    validateFilledData(filledData) {
        const violations = [];
        for (const field of this.props.fields) {
            const reason = field.validate(filledData[field.fieldKey]);
            if (reason !== null)
                violations.push({ fieldKey: field.fieldKey, reason });
        }
        const declared = new Set(this.props.fields.map((f) => f.fieldKey));
        for (const key of Object.keys(filledData)) {
            if (!declared.has(key))
                violations.push({
                    fieldKey: key,
                    reason: "This field is not part of this template.",
                });
        }
        return violations;
    }
    validatePartial(partial) {
        const violations = [];
        const byKey = new Map(this.props.fields.map((f) => [f.fieldKey, f]));
        for (const [key, value] of Object.entries(partial)) {
            const field = byKey.get(key);
            if (!field) {
                violations.push({
                    fieldKey: key,
                    reason: "This field is not part of this template.",
                });
                continue;
            }
            if (value === null || value === undefined || value === "")
                continue;
            const reason = field.validate(value);
            if (reason !== null)
                violations.push({ fieldKey: key, reason });
        }
        return violations;
    }
    validateSubmission(filledData) {
        return this.validateFilledData(filledData).map((v) => v.fieldKey);
    }
    isEligible(userAttributes) {
        return this.props.eligibilityRules.every((rule) => rule.isSatisfiedBy(userAttributes.get(rule.attributeId.toString())));
    }
    unmetEligibilityRules(userAttributes) {
        return this.props.eligibilityRules
            .filter((rule) => !rule.isSatisfiedBy(userAttributes.get(rule.attributeId.toString())))
            .map((rule) => rule.snapshot());
    }
    snapshot() {
        return {
            code: this.props.code,
            classifierDocument: this.props.classifierDocument,
            categoryId: this.props.categoryId?.toString(),
            title: this.props.title.toJSON(),
            description: this.props.description?.toJSON(),
            sensitivityLevelId: this.props.sensitivityLevelId?.toString(),
            defaultPriority: this.props.defaultPriority,
            isActive: this.props.isActive,
            fields: this.props.fields.map((f) => f.snapshot()),
            eligibilityRules: this.props.eligibilityRules.map((r) => r.snapshot()),
        };
    }
}
exports.Template = Template;
//# sourceMappingURL=template.js.map