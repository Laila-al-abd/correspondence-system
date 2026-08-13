"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toStepInstanceView = toStepInstanceView;
exports.toRequestSummary = toRequestSummary;
exports.toRequestActionView = toRequestActionView;
exports.toDocumentView = toDocumentView;
exports.toPaymentView = toPaymentView;
exports.toTemplateFormView = toTemplateFormView;
exports.toRequestDetail = toRequestDetail;
const request_stage_1 = require("./request-stage");
const iso = (date) => date ? date.toISOString() : undefined;
function toStepInstanceView(s, stepDefinition) {
    const stepSnap = stepDefinition?.snapshot();
    return {
        id: s.id,
        workflowStepId: s.workflowStepId,
        stepName: stepSnap ? (stepSnap.name.ar || stepSnap.name.en) : undefined,
        assignedToUserId: s.assignedToUserId,
        status: s.status,
        slaDueAt: iso(s.slaDueAt),
        slaPaused: s.slaPaused,
        startedAt: iso(s.startedAt),
        completedAt: iso(s.completedAt),
        allowedActionTypeIds: stepDefinition ? stepDefinition.snapshot().allowedActionTypeIds : [],
        chargesFee: stepDefinition ? stepDefinition.chargesFee() : false,
    };
}
function toRequestSummary(request, outstandingPaymentCount = 0) {
    const s = request.snapshot();
    return {
        id: request.id.toString(),
        referenceNo: s.referenceNo,
        requesterId: s.requesterId,
        templateId: s.templateId,
        workflowPathId: s.workflowPathId,
        classificationStatus: s.classificationStatus,
        classificationConfidence: s.classificationConfidence,
        classifiedBy: s.classifiedBy,
        currentStatus: s.currentStatus,
        stage: (0, request_stage_1.deriveRequestStage)({
            currentStatus: s.currentStatus,
            classificationStatus: s.classificationStatus,
            confirmedAt: s.confirmedAt,
        }),
        priority: s.priority,
        slaRisk: s.slaRisk,
        slaDueAt: iso(s.slaDueAt),
        completedAt: iso(s.completedAt),
        outstandingPaymentCount,
    };
}
function toRequestActionView(action) {
    const s = action.snapshot();
    return {
        id: action.id.toString(),
        requestStepInstanceId: s.requestStepInstanceId,
        actorId: s.actorId,
        actionTypeId: s.actionTypeId,
        comment: s.comment,
        createdAt: s.createdAt.toISOString(),
    };
}
function toDocumentView(document) {
    const s = document.snapshot();
    return {
        id: document.id.toString(),
        requestId: s.requestId,
        requestActionId: s.requestActionId,
        uploaderId: s.uploaderId,
        docKind: s.docKind,
        storageKey: s.storageKey,
        fileName: s.fileName,
        mimeType: s.mimeType,
        fileSize: s.fileSize,
        ocrText: s.ocrText,
        uploadedAt: s.uploadedAt.toISOString(),
    };
}
function toPaymentView(payment) {
    const s = payment.snapshot();
    return {
        id: payment.id.toString(),
        requestId: s.requestId,
        requestStepInstanceId: s.requestStepInstanceId,
        amount: s.amount,
        currency: s.currency,
        status: s.status,
        requestedBy: s.requestedBy,
        settledBy: s.settledBy,
        requestedAt: iso(s.requestedAt),
        settledAt: iso(s.settledAt),
        waiverReason: s.waiverReason,
    };
}
function toTemplateFormView(template) {
    const s = template.snapshot();
    return {
        id: template.id.toString(),
        code: s.code,
        titleAr: s.title.ar,
        titleEn: s.title.en,
        descriptionAr: s.description?.ar,
        descriptionEn: s.description?.en,
        defaultPriority: s.defaultPriority,
        isActive: s.isActive,
        fields: s.fields.map((field) => ({
            key: field.fieldKey,
            labelAr: field.label.ar,
            labelEn: field.label.en,
            dataType: field.dataType,
            isRequired: field.isRequired,
            ordinal: field.ordinal,
            options: field.options.map((option) => ({
                value: option.value,
                labelAr: option.label.ar,
                labelEn: option.label.en,
                ordinal: option.ordinal,
            })),
        })),
    };
}
function missingRequiredFields(form, filledData) {
    if (!form)
        return [];
    const values = filledData ?? {};
    return form.fields
        .filter((field) => field.isRequired)
        .filter((field) => {
        const value = values[field.key];
        return value === null || value === undefined || value === '';
    })
        .map((field) => field.key);
}
function toRequestDetail(request, actions, documents, payments, durationEstimate, template, workflowSteps) {
    const snapshot = request.snapshot();
    const form = template ? toTemplateFormView(template) : undefined;
    const paymentViews = payments.map(toPaymentView);
    return {
        ...toRequestSummary(request, paymentViews.filter((p) => p.status === 'REQUIRED').length),
        rawText: snapshot.rawText,
        filledData: snapshot.filledData,
        confirmedAt: iso(snapshot.confirmedAt),
        businessDurationMinutes: snapshot.businessDurationMinutes,
        durationEstimate,
        template: form,
        missingRequiredFields: missingRequiredFields(form, snapshot.filledData),
        stepInstances: snapshot.stepInstances.map((s) => {
            const def = workflowSteps?.find(ws => ws.id.toString() === s.workflowStepId);
            return toStepInstanceView(s, def);
        }),
        actions: actions.map(toRequestActionView),
        documents: documents.map(toDocumentView),
        payments: paymentViews,
    };
}
//# sourceMappingURL=request.view.js.map