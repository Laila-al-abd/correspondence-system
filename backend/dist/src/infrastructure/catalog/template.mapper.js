"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateMapper = exports.templateInclude = void 0;
const client_1 = require("../../../generated/prisma/client");
const template_1 = require("../../domain/catalog/template");
const template_field_1 = require("../../domain/catalog/template-field");
const template_field_option_1 = require("../../domain/catalog/template-field-option");
const template_eligibility_rule_1 = require("../../domain/catalog/template-eligibility-rule");
const identifier_1 = require("../../domain/shared/identifier");
const localized_text_1 = require("../../domain/shared/localized-text");
exports.templateInclude = {
    fields: { include: { options: true } },
    eligibilityRules: true,
};
const toLocalized = (json) => {
    const value = json;
    return localized_text_1.LocalizedText.create(value.ar, value.en);
};
exports.TemplateMapper = {
    toDomain(row) {
        const fields = [...row.fields]
            .sort((a, b) => a.ordinal - b.ordinal)
            .map((f) => template_field_1.TemplateField.rehydrate(identifier_1.Identifier.of(f.id), {
            fieldKey: f.fieldKey,
            label: toLocalized(f.label),
            dataType: f.dataType,
            isRequired: f.isRequired,
            ordinal: f.ordinal,
            extractionQuestion: f.extractionQuestion ?? undefined,
            options: [...f.options]
                .sort((a, b) => a.ordinal - b.ordinal)
                .map((o) => template_field_option_1.TemplateFieldOption.create(o.value, toLocalized(o.label), o.ordinal)),
        }));
        const eligibilityRules = row.eligibilityRules.map((r) => template_eligibility_rule_1.TemplateEligibilityRule.rehydrate(identifier_1.Identifier.of(r.id), {
            attributeId: identifier_1.Identifier.of(r.attributeId),
            operator: r.operator,
            value: r.value,
        }));
        return template_1.Template.rehydrate(identifier_1.Identifier.of(row.id), {
            code: row.code ?? undefined,
            classifierDocument: row.classifierDocument ?? undefined,
            categoryId: row.categoryId ? identifier_1.Identifier.of(row.categoryId) : undefined,
            title: toLocalized(row.title),
            description: row.description ? toLocalized(row.description) : undefined,
            sensitivityLevelId: row.sensitivityLevelId ? identifier_1.Identifier.of(row.sensitivityLevelId) : undefined,
            defaultPriority: row.defaultPriority,
            isActive: row.isActive,
            fields,
            eligibilityRules,
        });
    },
    toRoot(template) {
        const s = template.snapshot();
        return {
            id: template.id.toString(),
            code: s.code ?? null,
            classifierDocument: s.classifierDocument ?? null,
            categoryId: s.categoryId ?? null,
            title: s.title,
            description: s.description
                ? s.description
                : client_1.Prisma.JsonNull,
            sensitivityLevelId: s.sensitivityLevelId ?? null,
            defaultPriority: s.defaultPriority,
            isActive: s.isActive,
        };
    },
};
//# sourceMappingURL=template.mapper.js.map