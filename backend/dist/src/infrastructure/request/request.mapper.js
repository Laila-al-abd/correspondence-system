"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestMapper = exports.requestInclude = void 0;
const request_1 = require("../../domain/request/request");
const request_step_instance_1 = require("../../domain/request/request-step-instance");
const identifier_1 = require("../../domain/shared/identifier");
exports.requestInclude = {
    stepInstances: true,
};
const toStepInstanceDomain = (row) => request_step_instance_1.RequestStepInstance.rehydrate(identifier_1.Identifier.of(row.id), {
    requestId: identifier_1.Identifier.of(row.requestId),
    workflowStepId: identifier_1.Identifier.of(row.workflowStepId),
    assignedToUserId: row.assignedToUserId != null
        ? identifier_1.Identifier.of(row.assignedToUserId)
        : undefined,
    status: row.status,
    slaDueAt: row.slaDueAt ?? undefined,
    slaPaused: row.slaPaused,
    startedAt: row.startedAt ?? undefined,
    completedAt: row.completedAt ?? undefined,
});
exports.RequestMapper = {
    toDomain(row) {
        const stepInstances = row.stepInstances
            .slice()
            .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
            .map(toStepInstanceDomain);
        return request_1.Request.rehydrate(identifier_1.Identifier.of(row.id), {
            requesterId: identifier_1.Identifier.of(row.requesterId),
            referenceNo: row.referenceNo ?? undefined,
            rawText: row.rawText ?? undefined,
            templateId: row.templateId != null ? identifier_1.Identifier.of(row.templateId) : undefined,
            workflowPathId: row.workflowPathId != null ? identifier_1.Identifier.of(row.workflowPathId) : undefined,
            filledData: row.filledData
                ? row.filledData
                : {},
            classificationStatus: row.classificationStatus,
            classificationConfidence: row.classificationConfidence != null
                ? row.classificationConfidence.toNumber()
                : undefined,
            classifiedBy: row.classifiedBy ?? undefined,
            currentStatus: row.currentStatus,
            priority: row.priority,
            slaRisk: row.slaRisk,
            slaDueAt: row.slaDueAt ?? undefined,
            completedAt: row.completedAt ?? undefined,
            confirmedAt: row.confirmedAt ?? undefined,
            extractionAttemptedAt: row.extractionAttemptedAt ?? undefined,
            createdAt: row.createdAt,
            businessDurationMinutes: row.businessDurationMinutes ?? undefined,
            version: row.version,
            stepInstances,
        });
    },
    toRoot(request) {
        const s = request.snapshot();
        return {
            id: request.id.toString(),
            requesterId: s.requesterId,
            referenceNo: s.referenceNo ?? null,
            rawText: s.rawText ?? null,
            templateId: s.templateId ? s.templateId : null,
            workflowPathId: s.workflowPathId ? s.workflowPathId : null,
            filledData: s.filledData,
            classificationStatus: s.classificationStatus,
            classificationConfidence: s.classificationConfidence ?? null,
            classifiedBy: s.classifiedBy ?? null,
            currentStatus: s.currentStatus,
            priority: s.priority,
            slaRisk: s.slaRisk,
            slaDueAt: null,
            completedAt: s.completedAt ?? null,
            confirmedAt: s.confirmedAt ?? null,
            extractionAttemptedAt: s.extractionAttemptedAt ?? null,
            businessDurationMinutes: s.businessDurationMinutes ?? null,
            version: s.version,
        };
    },
    toStepInstanceRow(si) {
        return {
            id: si.id,
            requestId: si.requestId,
            workflowStepId: si.workflowStepId,
            assignedToUserId: si.assignedToUserId ? si.assignedToUserId : null,
            status: si.status,
            slaDueAt: si.slaDueAt ?? null,
            slaPaused: si.slaPaused,
            startedAt: si.startedAt ?? null,
            completedAt: si.completedAt ?? null,
        };
    },
};
//# sourceMappingURL=request.mapper.js.map