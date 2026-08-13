"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowPathMapper = exports.workflowPathInclude = void 0;
const client_1 = require("../../../generated/prisma/client");
const workflow_path_1 = require("../../domain/workflow/workflow-path");
const workflow_step_1 = require("../../domain/workflow/workflow-step");
const identifier_1 = require("../../domain/shared/identifier");
const localized_text_1 = require("../../domain/shared/localized-text");
exports.workflowPathInclude = {
    steps: { include: { allowedActions: true, dependencies: true } },
};
const toLocalized = (json) => {
    const value = json;
    return localized_text_1.LocalizedText.create(value.ar, value.en);
};
exports.WorkflowPathMapper = {
    toDomain(row) {
        const steps = row.steps.map((s) => workflow_step_1.WorkflowStep.rehydrate(identifier_1.Identifier.of(s.id), {
            name: toLocalized(s.name),
            description: s.description ? toLocalized(s.description) : undefined,
            assigneeType: s.assigneeType,
            assigneeRoleId: s.assigneeRoleId != null ? identifier_1.Identifier.of(s.assigneeRoleId) : undefined,
            assigneeDepartmentId: s.assigneeDepartmentId != null
                ? identifier_1.Identifier.of(s.assigneeDepartmentId)
                : undefined,
            defaultActionTypeId: s.defaultActionTypeId != null
                ? identifier_1.Identifier.of(s.defaultActionTypeId)
                : undefined,
            slaHours: s.slaHours != null ? s.slaHours.toNumber() : undefined,
            pausesSla: s.pausesSla,
            feeAmount: s.feeAmount != null ? s.feeAmount.toNumber() : undefined,
            feeCurrency: s.feeCurrency ?? undefined,
            allowedActionTypeIds: new Set(s.allowedActions.map((a) => a.actionTypeId.toString())),
            dependsOnStepIds: new Set(s.dependencies.map((d) => d.dependsOnStepId.toString())),
        }));
        return workflow_path_1.WorkflowPath.rehydrate(identifier_1.Identifier.of(row.id), {
            templateId: identifier_1.Identifier.of(row.templateId),
            name: toLocalized(row.name),
            description: row.description ? toLocalized(row.description) : undefined,
            isActive: row.isActive,
            steps,
        });
    },
    toRoot(path) {
        const s = path.snapshot();
        return {
            id: path.id.toString(),
            templateId: s.templateId,
            name: s.name,
            description: s.description
                ? s.description
                : client_1.Prisma.JsonNull,
            isActive: s.isActive,
        };
    },
};
//# sourceMappingURL=workflow-path.mapper.js.map