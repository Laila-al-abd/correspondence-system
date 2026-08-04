import { Request } from '../../../../domain/request/request'
import { RequestAction } from '../../../../domain/request/request-action'
import { Document } from '../../../../domain/request/document'
import { Payment } from '../../../../domain/request/payment'
import { StepInstanceSnapshot } from '../../../../domain/request/request-step-instance'

/** Read models returned by the Request queries (flat, HTTP-friendly shapes). */

export interface StepInstanceView {
  id: string
  workflowStepId: string
  assignedToUserId?: string
  status: string
  slaDueAt?: string
  slaPaused: boolean
  startedAt?: string
  completedAt?: string
}

export interface RequestActionView {
  id: string
  requestStepInstanceId?: string
  actorId: string
  actionTypeId: string
  comment?: string
  createdAt: string
}

export interface DocumentView {
  id: string
  requestId: string
  requestActionId?: string
  uploaderId: string
  docKind: string
  storageKey: string
  fileName: string
  mimeType: string
  fileSize: number
  ocrText?: string
  uploadedAt: string
}

export interface PaymentView {
  id: string
  requestId: string
  requestStepInstanceId?: string
  amount: number
  currency: string
  status: string
  requestedBy?: string
  confirmedBy?: string
  requestedAt?: string
  confirmedAt?: string
}

export interface RequestSummaryView {
  id: string
  referenceNo?: string
  requesterId: string
  templateId?: string
  workflowPathId?: string
  classificationStatus: string
  classificationConfidence?: number
  classifiedBy?: string
  currentStatus: string
  priority: string
  slaRisk: string
  sensitivityLevelId?: string
  slaDueAt?: string
  completedAt?: string
}

/**
 * Where a duration estimate came from. The client is told which, because the two
 * answer different questions and should not be worded the same way: OBSERVED is
 * "requests like this usually take", DECLARED is "this is allowed to take".
 */
export type DurationEstimateBasis = 'OBSERVED' | 'DECLARED'

export interface DurationEstimateView {
  /** Working minutes. */
  minutes: number
  basis: DurationEstimateBasis
  /**
   * How many completed requests the figure rests on. Zero on a DECLARED
   * estimate, and worth showing: an estimate drawn from six requests deserves
   * less confidence than one drawn from six hundred, and only the caller knows
   * how to say so.
   */
  sampleSize: number
}

export interface RequestDetailView extends RequestSummaryView {
  /**
   * The citizen's original free text, verbatim and complete -- never a summary
   * or a truncation. This is the input the NLP classifier reads, and it is also
   * what a reviewer needs in order to check that the chosen template was the
   * right one. Deliberately on the detail view only: list endpoints return many
   * rows and must stay small.
   */
  rawText?: string
  /** The submitted form values, once a template has been applied. */
  filledData?: Record<string, unknown>
  /**
   * When the requester accepted the template and values proposed for them.
   * Absent means the request is still waiting for that answer, which is what a
   * client needs in order to show the confirmation step at all.
   */
  confirmedAt?: string
  /**
   * Working minutes from submission to completion, present only once the
   * request is finished. Working rather than wall-clock, so a request that sat
   * over a weekend is not reported as two days slow.
   */
  businessDurationMinutes?: number
  /**
   * How long a request of this template usually takes, in working minutes.
   *
   * Absent only when the template has neither history nor a declared budget --
   * which means nobody has ever said how long this is supposed to take, and
   * inventing a number would be worse than saying nothing.
   */
  durationEstimate?: DurationEstimateView
  stepInstances: StepInstanceView[]
  actions: RequestActionView[]
  documents: DocumentView[]
  payments: PaymentView[]
}

const iso = (date?: Date): string | undefined =>
  date ? date.toISOString() : undefined

export function toStepInstanceView(s: StepInstanceSnapshot): StepInstanceView {
  return {
    id: s.id,
    workflowStepId: s.workflowStepId,
    assignedToUserId: s.assignedToUserId,
    status: s.status,
    slaDueAt: iso(s.slaDueAt),
    slaPaused: s.slaPaused,
    startedAt: iso(s.startedAt),
    completedAt: iso(s.completedAt),
  }
}

export function toRequestSummary(request: Request): RequestSummaryView {
  const s = request.snapshot()
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
    priority: s.priority,
    slaRisk: s.slaRisk,
    sensitivityLevelId: s.sensitivityLevelId,
    slaDueAt: iso(s.slaDueAt),
    completedAt: iso(s.completedAt),
  }
}

export function toRequestActionView(action: RequestAction): RequestActionView {
  const s = action.snapshot()
  return {
    id: action.id.toString(),
    requestStepInstanceId: s.requestStepInstanceId,
    actorId: s.actorId,
    actionTypeId: s.actionTypeId,
    comment: s.comment,
    createdAt: s.createdAt.toISOString(),
  }
}

export function toDocumentView(document: Document): DocumentView {
  const s = document.snapshot()
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
  }
}

export function toPaymentView(payment: Payment): PaymentView {
  const s = payment.snapshot()
  return {
    id: payment.id.toString(),
    requestId: s.requestId,
    requestStepInstanceId: s.requestStepInstanceId,
    amount: s.amount,
    currency: s.currency,
    status: s.status,
    requestedBy: s.requestedBy,
    confirmedBy: s.confirmedBy,
    requestedAt: iso(s.requestedAt),
    confirmedAt: iso(s.confirmedAt),
  }
}

export function toRequestDetail(
  request: Request,
  actions: RequestAction[],
  documents: Document[],
  payments: Payment[],
  durationEstimate?: DurationEstimateView,
): RequestDetailView {
  const snapshot = request.snapshot()
  return {
    ...toRequestSummary(request),
    rawText: snapshot.rawText,
    filledData: snapshot.filledData,
    confirmedAt: iso(snapshot.confirmedAt),
    businessDurationMinutes: snapshot.businessDurationMinutes,
    durationEstimate,
    stepInstances: snapshot.stepInstances.map(toStepInstanceView),
    actions: actions.map(toRequestActionView),
    documents: documents.map(toDocumentView),
    payments: payments.map(toPaymentView),
  }
}
