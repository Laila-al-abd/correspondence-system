import { Request } from '../../../../domain/request/request'
import { RequestAction } from '../../../../domain/request/request-action'
import { Document } from '../../../../domain/request/document'
import { Payment } from '../../../../domain/request/payment'
import { StepInstanceSnapshot } from '../../../../domain/request/request-step-instance'
import { Template } from '../../../../domain/catalog/template'
import { RequestStage, deriveRequestStage } from './request-stage'

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
  settledBy?: string
  requestedAt?: string
  settledAt?: string
  waiverReason?: string
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
  /**
   * currentStatus says where the request is in its lifecycle; `stage` says what
   * is happening to it in words a person recognises. Derived, never stored --
   * see request-stage.ts.
   */
  stage: RequestStage
  priority: string
  slaRisk: string
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

export interface TemplateFieldOptionFormView {
  value: string
  labelAr: string
  labelEn?: string
  ordinal: number
}

/**
 * One input on the form, as the person filling it needs to see it.
 *
 * `key` is the name the answer is stored under, so it is what a client sends
 * back in filledData -- labels are for reading and must never be used as keys.
 */
export interface TemplateFieldFormView {
  key: string
  labelAr: string
  labelEn?: string
  dataType: string
  isRequired: boolean
  /** Presentation order, 1-based and already sorted. */
  ordinal: number
  /** Populated for ENUM fields, empty for every other type. */
  options: TemplateFieldOptionFormView[]
}

/**
 * The form a request is being filled against.
 *
 * This exists because a request detail on its own is unrenderable: filledData is
 * a bag of keys with no labels, no types and no statement of which answers are
 * mandatory, so no client could draw the confirmation form or tell the requester
 * why confirmation was refused.
 *
 * Deliberately omitted: `classifierDocument` and each field's
 * `extractionQuestion`. Both are model inputs, fine-tuned on those exact
 * strings; putting either in front of a requester would show them a prompt as
 * though it were a caption. Authoring tools read those through the template
 * catalogue, which is gated to `template.manage`.
 */
export interface TemplateFormView {
  id: string
  code?: string
  titleAr: string
  titleEn?: string
  descriptionAr?: string
  descriptionEn?: string
  defaultPriority: string
  isActive: boolean
  fields: TemplateFieldFormView[]
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
  /**
   * The form definition this request is filled against. Absent until the request
   * has been classified, because until then there is no form -- only the
   * sentence the requester wrote.
   */
  template?: TemplateFormView
  /**
   * Required fields that are still empty, by key.
   *
   * Computed server-side because the confirmation gate is enforced server-side:
   * a form that looks complete in the browser and is then refused on submit is
   * the worst of both worlds. A non-empty list here is the normal case rather
   * than an error -- the extractor abstains on any field it cannot answer
   * confidently, and those are exactly the ones the requester is being asked to
   * fill in. Empty whenever there is no template yet.
   */
  missingRequiredFields: string[]
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
    stage: deriveRequestStage({
      currentStatus: s.currentStatus,
      classificationStatus: s.classificationStatus,
      confirmedAt: s.confirmedAt,
    }),
    priority: s.priority,
    slaRisk: s.slaRisk,
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
    settledBy: s.settledBy,
    requestedAt: iso(s.requestedAt),
    settledAt: iso(s.settledAt),
    waiverReason: s.waiverReason,
  }
}

/**
 * The renderable form definition, from the template aggregate.
 *
 * Fields arrive from the mapper already sorted by ordinal, and options with
 * them, so a client can render the list as given without re-sorting.
 */
export function toTemplateFormView(template: Template): TemplateFormView {
  const s = template.snapshot()
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
  }
}

/**
 * Which required answers are still missing.
 *
 * Emptiness is judged the same way the domain judges it -- null, undefined and
 * the empty string all mean "unanswered" -- so this list and the confirmation
 * gate can never disagree about whether the form is ready.
 */
function missingRequiredFields(
  form: TemplateFormView | undefined,
  filledData?: Record<string, unknown>,
): string[] {
  if (!form) return []
  const values = filledData ?? {}
  return form.fields
    .filter((field) => field.isRequired)
    .filter((field) => {
      const value = values[field.key]
      return value === null || value === undefined || value === ''
    })
    .map((field) => field.key)
}

export function toRequestDetail(
  request: Request,
  actions: RequestAction[],
  documents: Document[],
  payments: Payment[],
  durationEstimate?: DurationEstimateView,
  template?: Template,
): RequestDetailView {
  const snapshot = request.snapshot()
  const form = template ? toTemplateFormView(template) : undefined
  return {
    ...toRequestSummary(request),
    rawText: snapshot.rawText,
    filledData: snapshot.filledData,
    confirmedAt: iso(snapshot.confirmedAt),
    businessDurationMinutes: snapshot.businessDurationMinutes,
    durationEstimate,
    template: form,
    missingRequiredFields: missingRequiredFields(form, snapshot.filledData),
    stepInstances: snapshot.stepInstances.map(toStepInstanceView),
    actions: actions.map(toRequestActionView),
    documents: documents.map(toDocumentView),
    payments: payments.map(toPaymentView),
  }
}
