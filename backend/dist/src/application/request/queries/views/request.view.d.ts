import { Request } from '../../../../domain/request/request';
import { RequestAction } from '../../../../domain/request/request-action';
import { Document } from '../../../../domain/request/document';
import { Payment } from '../../../../domain/request/payment';
import { StepInstanceSnapshot } from '../../../../domain/request/request-step-instance';
import { Template } from '../../../../domain/catalog/template';
import { RequestStage } from './request-stage';
import { WorkflowStep } from '../../../../domain/workflow/workflow-step';
export interface StepInstanceView {
    id: string;
    workflowStepId: string;
    assignedToUserId?: string;
    assignedToName?: string;
    stepName?: string;
    status: string;
    slaDueAt?: string;
    slaPaused: boolean;
    startedAt?: string;
    completedAt?: string;
    allowedActionTypeIds: string[];
    chargesFee: boolean;
}
export interface RequestActionView {
    id: string;
    requestStepInstanceId?: string;
    actorId: string;
    actionTypeId: string;
    comment?: string;
    createdAt: string;
}
export interface DocumentView {
    id: string;
    requestId: string;
    requestActionId?: string;
    uploaderId: string;
    docKind: string;
    storageKey: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    ocrText?: string;
    uploadedAt: string;
}
export interface PaymentView {
    id: string;
    requestId: string;
    requestStepInstanceId?: string;
    amount: number;
    currency: string;
    status: string;
    requestedBy?: string;
    settledBy?: string;
    requestedAt?: string;
    settledAt?: string;
    waiverReason?: string;
}
export interface RequestSummaryView {
    id: string;
    referenceNo?: string;
    requesterId: string;
    templateId?: string;
    workflowPathId?: string;
    classificationStatus: string;
    classificationConfidence?: number;
    classifiedBy?: string;
    currentStatus: string;
    stage: RequestStage;
    priority: string;
    slaRisk: string;
    slaDueAt?: string;
    completedAt?: string;
    outstandingPaymentCount: number;
}
export type DurationEstimateBasis = 'OBSERVED' | 'DECLARED';
export interface DurationEstimateView {
    minutes: number;
    basis: DurationEstimateBasis;
    sampleSize: number;
}
export interface TemplateFieldOptionFormView {
    value: string;
    labelAr: string;
    labelEn?: string;
    ordinal: number;
}
export interface TemplateFieldFormView {
    key: string;
    labelAr: string;
    labelEn?: string;
    dataType: string;
    isRequired: boolean;
    ordinal: number;
    options: TemplateFieldOptionFormView[];
}
export interface TemplateFormView {
    id: string;
    code?: string;
    titleAr: string;
    titleEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    defaultPriority: string;
    isActive: boolean;
    fields: TemplateFieldFormView[];
}
export interface RequestDetailView extends RequestSummaryView {
    rawText?: string;
    filledData?: Record<string, unknown>;
    confirmedAt?: string;
    businessDurationMinutes?: number;
    durationEstimate?: DurationEstimateView;
    template?: TemplateFormView;
    missingRequiredFields: string[];
    stepInstances: StepInstanceView[];
    actions: RequestActionView[];
    documents: DocumentView[];
    payments: PaymentView[];
}
export declare function toStepInstanceView(s: StepInstanceSnapshot, stepDefinition?: WorkflowStep, assignedToName?: string): StepInstanceView;
export declare function toRequestSummary(request: Request, outstandingPaymentCount?: number): RequestSummaryView;
export declare function toRequestActionView(action: RequestAction): RequestActionView;
export declare function toDocumentView(document: Document): DocumentView;
export declare function toPaymentView(payment: Payment): PaymentView;
export declare function toTemplateFormView(template: Template): TemplateFormView;
export declare function toRequestDetail(request: Request, actions: RequestAction[], documents: Document[], payments: Payment[], durationEstimate?: DurationEstimateView, template?: Template, workflowSteps?: WorkflowStep[], assigneeNames?: Readonly<Record<string, string>>): RequestDetailView;
