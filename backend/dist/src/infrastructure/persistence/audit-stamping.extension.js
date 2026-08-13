"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditStampingExtension = void 0;
const client_1 = require("../../../generated/prisma/client");
const request_context_1 = require("../shared/request-context");
const CREATED_BY_MODELS = new Set([
    'User',
    'AttributeDefinition',
    'UserAttribute',
    'Role',
    'PermissionGroup',
    'Permission',
    'RolePermission',
    'Delegation',
    'OrgUnitType',
    'Department',
    'Language',
    'SensitivityLevel',
    'RequestCategory',
    'Template',
    'TemplateField',
    'TemplateFieldOption',
    'TemplateEligibilityRule',
    'ActionType',
    'WorkflowPath',
    'WorkflowStep',
    'WorkflowStepAllowedAction',
    'WorkflowStepDependency',
    'Request',
    'RequestStepInstance',
    'RequestAction',
    'Payment',
    'AcademicCalendar',
    'Notification',
    'MlPrediction',
    'SystemSetting',
]);
const UPDATED_BY_MODELS = new Set([
    'User',
    'AttributeDefinition',
    'UserAttribute',
    'Role',
    'PermissionGroup',
    'Permission',
    'Delegation',
    'OrgUnitType',
    'Department',
    'Language',
    'SensitivityLevel',
    'RequestCategory',
    'Template',
    'TemplateField',
    'TemplateFieldOption',
    'TemplateEligibilityRule',
    'ActionType',
    'WorkflowPath',
    'WorkflowStep',
    'Request',
    'RequestStepInstance',
    'Payment',
    'AcademicCalendar',
    'Notification',
    'SystemSetting',
    'RequestNumberSequence',
]);
function currentActor() {
    const userId = request_context_1.RequestContextStore.userId();
    if (!userId)
        return undefined;
    try {
        return userId;
    }
    catch {
        return undefined;
    }
}
function stamp(data, actor, fields) {
    const row = data && typeof data === 'object' && !Array.isArray(data)
        ? { ...data }
        : {};
    for (const field of fields) {
        if (row[field] === undefined)
            row[field] = actor;
    }
    return row;
}
function stampAll(data, actor, fields) {
    if (Array.isArray(data))
        return data.map((row) => stamp(row, actor, fields));
    return stamp(data, actor, fields);
}
function insertFields(model) {
    const fields = [];
    if (CREATED_BY_MODELS.has(model))
        fields.push('createdBy');
    if (UPDATED_BY_MODELS.has(model))
        fields.push('updatedBy');
    return fields;
}
exports.auditStampingExtension = client_1.Prisma.defineExtension({
    name: 'audit-stamping',
    query: {
        $allModels: {
            async create({ model, args, query }) {
                const actor = currentActor();
                if (actor !== undefined) {
                    const fields = insertFields(model);
                    if (fields.length > 0) {
                        const a = args;
                        a.data = stamp(a.data, actor, fields);
                    }
                }
                return query(args);
            },
            async createMany({ model, args, query }) {
                const actor = currentActor();
                if (actor !== undefined) {
                    const fields = insertFields(model);
                    const a = args;
                    if (fields.length > 0 && a.data !== undefined) {
                        a.data = stampAll(a.data, actor, fields);
                    }
                }
                return query(args);
            },
            async update({ model, args, query }) {
                const actor = currentActor();
                if (actor !== undefined && UPDATED_BY_MODELS.has(model)) {
                    const a = args;
                    a.data = stamp(a.data, actor, ['updatedBy']);
                }
                return query(args);
            },
            async updateMany({ model, args, query }) {
                const actor = currentActor();
                if (actor !== undefined && UPDATED_BY_MODELS.has(model)) {
                    const a = args;
                    a.data = stamp(a.data, actor, ['updatedBy']);
                }
                return query(args);
            },
            async upsert({ model, args, query }) {
                const actor = currentActor();
                if (actor !== undefined) {
                    const a = args;
                    const createFields = insertFields(model);
                    if (createFields.length > 0) {
                        a.create = stamp(a.create, actor, createFields);
                    }
                    if (UPDATED_BY_MODELS.has(model)) {
                        a.update = stamp(a.update, actor, ['updatedBy']);
                    }
                }
                return query(args);
            },
        },
    },
});
//# sourceMappingURL=audit-stamping.extension.js.map