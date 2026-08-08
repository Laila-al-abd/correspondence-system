/**
 * Frontend TypeScript types for the Request module.
 * Synchronized with backend DTOs, command interfaces, and query views.
 * Generated from:
 * - backend/src/interface/request/dto/*.dto.ts
 * - backend/src/application/request/commands/**.command.ts
 * - backend/src/application/request/queries/views/*.view.ts
 * - backend/src/domain/request/enums.ts
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Classification status of a request.
 * Source: backend/src/domain/request/enums.ts
 */
export enum ClassificationStatus {
  PENDING = 'PENDING',
  CLASSIFIED = 'CLASSIFIED',
  HITL = 'HITL',
}

/**
 * Who classified the request.
 * Source: backend/src/domain/request/enums.ts
 */
export enum ClassifiedBy {
  NLP = 'NLP',
  HITL = 'HITL',
}

/**
 * Lifecycle status of a request.
 * Source: backend/src/domain/request/enums.ts
 */
export enum RequestStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

/**
 * Status of a workflow step instance.
 * Source: backend/src/domain/request/enums.ts
 */
export enum StepInstanceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING = 'WAITING',
  DONE = 'DONE',
  SKIPPED = 'SKIPPED',
  REJECTED = 'REJECTED',
}

/**
 * Business priority levels.
 * Source: backend/src/domain/request/enums.ts
 */
export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * Payment status.
 * Source: backend/src/domain/request/enums.ts
 */
export enum PaymentStatus {
  REQUIRED = 'REQUIRED',
  CONFIRMED = 'CONFIRMED',
  WAIVED = 'WAIVED',
}

/**
 * Document kind.
 * Source: backend/src/domain/request/enums.ts
 */
export enum DocKind {
  UPLOADED = 'UPLOADED',
  GENERATED = 'GENERATED',
}

/**
 * SLA risk level.
 * Source: backend/src/domain/request/enums.ts
 */
export enum SlaRisk {
  ON_TRACK = 'ON_TRACK',
  AT_RISK = 'AT_RISK',
  BREACHED = 'BREACHED',
}

/**
 * Step action kinds.
 * Source: backend/src/application/request/commands/act-on-step/act-on-step.command.ts
 */
export enum StepActionKind {
  START = 'START',
  COMPLETE = 'COMPLETE',
  REJECT = 'REJECT',
  SKIP = 'SKIP',
}

/**
 * Payment settlement outcomes.
 * Source: backend/src/application/request/commands/settle-payment/settle-payment.command.ts
 */
export enum PaymentSettlement {
  CONFIRM = 'CONFIRM',
  WAIVE = 'WAIVE',
}

/**
 * Confirmation outcomes.
 * Source: backend/src/application/request/commands/confirm-request/confirm-request.command.ts
 */
export type ConfirmOutcome = 'CONFIRM' | 'DISPUTE'

/**
 * Request stage (derived badge).
 * Source: backend/src/application/request/queries/views/request-stage.ts
 */
export type RequestStage =
  | 'AWAITING_CLASSIFICATION'
  | 'IN_HUMAN_REVIEW'
  | 'AWAITING_CONFIRMATION'
  | 'READY_TO_START'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'

/**
 * Duration estimate basis.
 * Source: backend/src/application/request/queries/views/request.view.ts
 */
export type DurationEstimateBasis = 'OBSERVED' | 'DECLARED'

// ============================================================================
// DTO Types (matching backend DTOs)
// ============================================================================

/**
 * Request body for submitting a new request.
 * POST /requests
 * Matches: backend/src/interface/request/dto/submit-request.dto.ts
 */
export interface SubmitRequestDto {
  rawText?: string;
  filledData?: Record<string, unknown>;
}

/**
 * Request body for confirming a request.
 * POST /requests/:id/confirm
 * Matches: backend/src/interface/request/dto/confirm-request.dto.ts
 */
export interface ConfirmRequestDto {
  outcome: ConfirmOutcome;
  filledData?: Record<string, unknown>;
}

/**
 * Request body for acting on a step.
 * POST /requests/:id/steps/:stepInstanceId/act
 * Matches: backend/src/interface/request/dto/act-on-step.dto.ts
 */
export interface ActOnStepDto {
  action: StepActionKind;
  actionTypeId?: string;
  comment?: string;
}

/**
 * Request body for assigning a step.
 * POST /requests/:id/steps/:stepInstanceId/assign
 * Matches: backend/src/interface/request/dto/assign-step.dto.ts
 */
export interface AssignStepDto {
  assigneeUserId: string;
}

/**
 * Request body for changing request priority.
 * PATCH /requests/:id/priority
 * Matches: backend/src/interface/request/dto/change-priority.dto.ts
 */
export interface ChangePriorityDto {
  priority: Priority;
  reason: string;
}

/**
 * Request body for human classification.
 * POST /requests/:id/classify/human
 * Matches: backend/src/interface/request/dto/classify-by-human.dto.ts
 */
export interface ClassifyByHumanDto {
  templateId: string;
  filledData?: Record<string, unknown>;
}

/**
 * Request body for model classification.
 * POST /requests/:id/classify/model
 * Matches: backend/src/interface/request/dto/classify-by-model.dto.ts
 */
export interface ClassifyByModelDto {
  templateId: string;
  confidence: number;
  threshold?: number;
  modelVersion?: string;
}

/**
 * Extraction metadata for one field.
 * Matches: backend/src/interface/request/dto/extraction-meta.dto.ts
 */
export interface ExtractionMetaDto {
  raw?: string;
  charStart?: number;
  charEnd?: number;
  score?: number;
}

/**
 * Request body for recording extraction results.
 * PATCH /requests/:id/filled-data
 * Matches: backend/src/interface/request/dto/record-extraction.dto.ts
 */
export interface RecordExtractionDto {
  filledData: Record<string, unknown>;
  abstained?: string[];
  extractionMeta?: Record<string, ExtractionMetaDto>;
  modelVersion: string;
  nullThreshold?: number;
}

/**
 * Request body for uploading a document.
 * POST /requests/:id/documents
 * Matches: backend/src/interface/request/dto/upload-document.dto.ts
 */
export interface UploadDocumentDto {
  fileName: string;
  mimeType: string;
  contentBase64: string;
  docKind?: DocKind;
  requestActionId?: string;
  ocrText?: string;
}

/**
 * Request body for waiving a payment.
 * POST /requests/:id/payments/:paymentId/waive
 * Matches: backend/src/interface/request/dto/waive-payment.dto.ts
 */
export interface WaivePaymentDto {
  reason: string;
}

/**
 * Query parameters for listing assigned requests.
 * GET /requests/assigned
 * Matches: backend/src/interface/request/dto/list-assigned.dto.ts
 */
export interface ListAssignedDto {
  ready?: string; // 'true' | 'false'
  limit?: string;
  cursor?: string;
}

/**
 * Query parameters for listing queued requests.
 * GET /requests/queue
 * Matches: backend/src/interface/request/dto/list-queue.dto.ts
 */
export interface ListQueueDto {
  status: RequestStatus;
  classificationStatus?: ClassificationStatus;
  hasFilledData?: string; // 'true' | 'false'
  extracted?: string; // 'true' | 'false'
  limit?: string;
  cursor?: string;
}

// ============================================================================
// Command Input Types (matching backend command interfaces)
// ============================================================================

/**
 * Input for SubmitRequestCommand.
 * Matches: backend/src/application/request/commands/submit-request/submit-request.command.ts
 */
export interface SubmitRequestInput {
  requesterId: string;
  rawText?: string;
  filledData?: Record<string, unknown>;
}

/**
 * Input for ActOnStepCommand.
 * Matches: backend/src/application/request/commands/act-on-step/act-on-step.command.ts
 */
export interface ActOnStepInput {
  requestId: string;
  stepInstanceId: string;
  actorId: string;
  action: StepActionKind;
  actionTypeId?: string;
  comment?: string;
}

/**
 * Input for ConfirmRequestCommand.
 * Matches: backend/src/application/request/commands/confirm-request/confirm-request.command.ts
 */
export interface ConfirmRequestInput {
  requestId: string;
  actorId: string;
  outcome: ConfirmOutcome;
  filledData?: Record<string, unknown>;
}

/**
 * Input for AssignStepCommand.
 * Matches: backend/src/application/request/commands/assign-step/assign-step.command.ts
 */
export interface AssignStepInput {
  requestId: string;
  stepInstanceId: string;
  assigneeUserId: string;
}

/**
 * Input for ChangeRequestPriorityCommand.
 * Matches: backend/src/application/request/commands/change-request-priority/change-request-priority.command.ts
 */
export interface ChangeRequestPriorityInput {
  requestId: string;
  actorId: string;
  priority: string;
  reason: string;
}

/**
 * Input for ClassifyRequestByHumanCommand.
 * Matches: backend/src/application/request/commands/classify-request-by-human/classify-request-by-human.command.ts
 */
export interface ClassifyRequestByHumanInput {
  requestId: string;
  templateId: string;
  filledData?: Record<string, unknown>;
}

/**
 * Input for ClassifyRequestByModelCommand.
 * Matches: backend/src/application/request/commands/classify-request-by-model/classify-request-by-model.command.ts
 */
export interface ClassifyRequestByModelInput {
  requestId: string;
  templateId: string;
  confidence: number;
  threshold?: number;
  modelVersion?: string;
}

/**
 * Input for UploadDocumentCommand.
 * Matches: backend/src/application/request/commands/upload-document/upload-document.command.ts
 */
export interface UploadDocumentInput {
  requestId: string;
  uploaderId: string;
  fileName: string;
  mimeType: string;
  contentBase64: string;
  docKind?: string;
  requestActionId?: string;
  ocrText?: string;
}

/**
 * Extraction field metadata for command layer.
 * Matches: backend/src/application/request/commands/record-extraction/record-extraction.command.ts
 */
export interface ExtractionFieldMeta {
  raw?: string;
  charStart?: number;
  charEnd?: number;
  score?: number;
}

/**
 * Input for RecordExtractionCommand.
 * Matches: backend/src/application/request/commands/record-extraction/record-extraction.command.ts
 */
export interface RecordExtractionInput {
  requestId: string;
  filledData: Record<string, unknown>;
  abstained?: string[];
  extractionMeta?: Record<string, ExtractionFieldMeta>;
  modelVersion: string;
  nullThreshold?: number;
}

/**
 * Input for StartRequestWorkflowCommand.
 * Matches: backend/src/application/request/commands/start-request-workflow/start-request-workflow.command.ts
 */
export interface StartRequestWorkflowInput {
  requestId: string;
}

/**
 * Input for SettlePaymentCommand.
 * Matches: backend/src/application/request/commands/settle-payment/settle-payment.command.ts
 */
export interface SettlePaymentInput {
  requestId: string;
  paymentId: string;
  actorId: string;
  settlement: PaymentSettlement;
  reason?: string;
}

// ============================================================================
// Query View Types (matching backend query views)
// ============================================================================

/**
 * Request stage input for deriving the stage badge.
 * Source: backend/src/application/request/queries/views/request-stage.ts
 */
export interface RequestStageInput {
  currentStatus: string;
  classificationStatus: string;
  confirmedAt?: string | Date | null;
}

/**
 * Step instance view.
 * Source: backend/src/application/request/queries/views/request.view.ts (StepInstanceView)
 */
export interface StepInstanceView {
  id: string;
  workflowStepId: string;
  assignedToUserId?: string;
  status: string;
  slaDueAt?: string;
  slaPaused: boolean;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Request action view.
 * Source: backend/src/application/request/queries/views/request.view.ts (RequestActionView)
 */
export interface RequestActionView {
  id: string;
  requestStepInstanceId?: string;
  actorId: string;
  actionTypeId: string;
  comment?: string;
  createdAt: string;
}

/**
 * Document view.
 * Source: backend/src/application/request/queries/views/request.view.ts (DocumentView)
 */
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

/**
 * Document download URL view.
 * GET /requests/:id/documents/:documentId/download-url
 * Source: backend/src/application/request/queries/get-document-download-url/get-document-download-url.handler.ts (DocumentDownloadUrlView)
 */
export interface DocumentDownloadUrlView {
  /** Presigned download URL */
  url: string;
  /** Original file name */
  fileName: string;
  /** Link TTL in seconds */
  expiresInSeconds: number;
  /** Expiration timestamp (ISO 8601) */
  expiresAt: string;
}

/**
 * Payment view.
 * Source: backend/src/application/request/queries/views/request.view.ts (PaymentView)
 */
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

/**
 * Request summary view (for list endpoints).
 * Source: backend/src/application/request/queries/views/request.view.ts (RequestSummaryView)
 */
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
}

/**
 * Duration estimate view.
 * Source: backend/src/application/request/queries/views/request.view.ts (DurationEstimateView)
 */
export interface DurationEstimateView {
  minutes: number;
  basis: DurationEstimateBasis;
  sampleSize: number;
}

/**
 * Template field option form view.
 * Source: backend/src/application/request/queries/views/request.view.ts (TemplateFieldOptionFormView)
 */
export interface TemplateFieldOptionFormView {
  value: string;
  labelAr: string;
  labelEn?: string;
  ordinal: number;
}

/**
 * Template field form view.
 * Source: backend/src/application/request/queries/views/request.view.ts (TemplateFieldFormView)
 */
export interface TemplateFieldFormView {
  key: string;
  labelAr: string;
  labelEn?: string;
  dataType: string;
  isRequired: boolean;
  ordinal: number;
  options: TemplateFieldOptionFormView[];
}

/**
 * Template form view.
 * Source: backend/src/application/request/queries/views/request.view.ts (TemplateFormView)
 */
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

/**
 * Full request detail view.
 * Source: backend/src/application/request/queries/views/request.view.ts (RequestDetailView)
 */
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

// ============================================================================
// Filled Data Violation (from template domain)
// ============================================================================

/**
 * A field that the template rejected.
 * Source: backend/src/domain/catalog/template.ts (FilledDataViolation)
 */
export interface FilledDataViolation {
  fieldKey: string;
  reason: string;
}

// ============================================================================
// Response Types (matching exact handler return shapes)
// ============================================================================

/**
 * Submit request response.
 * POST /requests
 * Matches: SubmitRequestHandler.execute() returns SubmitRequestResult
 * Source: backend/src/application/request/commands/submit-request/submit-request.handler.ts
 */
export interface SubmitRequestResponse {
  id: string;
  referenceNo: string;
}

/**
 * Confirm request response.
 * POST /requests/:id/confirm
 * Matches: ConfirmRequestHandler.execute() returns ConfirmationResult
 * Source: backend/src/application/request/commands/confirm-request/confirm-request.handler.ts
 */
export interface ConfirmRequestResponse {
  id: string;
  outcome: ConfirmOutcome;
  classificationStatus: string;
  confirmedAt?: string;
}

/**
 * Act on step response.
 * POST /requests/:id/steps/:stepInstanceId/actions
 * Matches: ActOnStepHandler.execute() returns ActOnStepResult
 * Source: backend/src/application/request/commands/act-on-step/act-on-step.handler.ts
 */
export interface ActOnStepResponse {
  stepInstanceId: string;
  stepStatus: string;
  requestStatus: string;
}

/**
 * Assign step response.
 * POST /requests/:id/steps/:stepInstanceId/assign
 * Matches: AssignStepHandler.execute() returns AssignStepResult
 * Source: backend/src/application/request/commands/assign-step/assign-step.handler.ts
 */
export interface AssignStepResponse {
  stepInstanceId: string;
  assignedToUserId: string;
}

/**
 * Change priority response.
 * PATCH /requests/:id/priority
 * Matches: ChangeRequestPriorityHandler.execute() returns PriorityChangeResult
 * Source: backend/src/application/request/commands/change-request-priority/change-request-priority.handler.ts
 */
export interface ChangePriorityResponse {
  id: string;
  previousPriority: string;
  priority: string;
}

/**
 * Classify by human response.
 * POST /requests/:id/classify/human
 * Matches: ClassifyRequestByHumanHandler.execute() returns HumanClassificationResult
 * Source: backend/src/application/request/commands/classify-request-by-human/classify-request-by-human.handler.ts
 */
export interface ClassifyByHumanResponse {
  id: string;
  classificationStatus: string;
  fieldsWritten: number;
}

/**
 * Classify by model response.
 * POST /requests/:id/classify/model
 * Matches: ClassifyRequestByModelHandler.execute() returns ClassificationResult
 * Source: backend/src/application/request/commands/classify-request-by-model/classify-request-by-model.handler.ts
 */
export interface ClassifyByModelResponse {
  id: string;
  classificationStatus: string;
}

/**
 * Record extraction response.
 * PATCH /requests/:id/filled-data
 * Matches: RecordExtractionHandler.execute() returns ExtractionResult
 * Source: backend/src/application/request/commands/record-extraction/record-extraction.handler.ts
 */
export interface RecordExtractionResponse {
  id: string;
  filledData: Record<string, unknown>;
  fieldsWritten: number;
  fieldsAbstained: number;
  rejected: FilledDataViolation[];
}

/**
 * Upload document response.
 * POST /requests/:id/documents
 * Matches: UploadDocumentHandler.execute() returns UploadDocumentResult
 * Source: backend/src/application/request/commands/upload-document/upload-document.handler.ts
 */
export interface UploadDocumentResponse {
  id: string;
  storageKey: string;
}

/**
 * Waive payment response.
 * POST /requests/:id/payments/:paymentId/waive
 * Matches: SettlePaymentHandler.execute() returns SettlePaymentResult (with WAIVE)
 * Source: backend/src/application/request/commands/settle-payment/settle-payment.handler.ts
 */
export interface WaivePaymentResponse {
  id: string;
  status: PaymentStatus;
  settledAt?: string;
}

/**
 * Confirm payment response.
 * POST /requests/:id/payments/:paymentId/confirm
 * Matches: SettlePaymentHandler.execute() returns SettlePaymentResult (with CONFIRM)
 * Source: backend/src/application/request/commands/settle-payment/settle-payment.handler.ts
 */
export interface ConfirmPaymentResponse {
  id: string;
  status: PaymentStatus;
  settledAt?: string;
}

/**
 * Start workflow response.
 * POST /requests/:id/start
 * Matches: StartRequestWorkflowHandler.execute() returns StartWorkflowResult
 * Source: backend/src/application/request/commands/start-request-workflow/start-request-workflow.handler.ts
 */
export interface StartWorkflowResponse {
  id: string;
  workflowPathId: string;
  stepCount: number;
  assignedStepCount: number;
  unassignedStepCount: number;
}