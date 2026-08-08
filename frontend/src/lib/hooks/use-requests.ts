// src/lib/hooks/use-requests.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsApi } from '@/lib/api/requests';
import {
  SubmitRequestDto,
  SubmitRequestResponse,
  ClassifyByModelDto,
  ClassifyByModelResponse,
  ClassifyByHumanDto,
  ClassifyByHumanResponse,
  ChangePriorityDto,
  ChangePriorityResponse,
  RecordExtractionDto,
  RecordExtractionResponse,
  ConfirmRequestDto,
  ConfirmRequestResponse,
  ActOnStepDto,
  ActOnStepResponse,
  AssignStepDto,
  AssignStepResponse,
  WaivePaymentDto,
  WaivePaymentResponse,
  UploadDocumentDto,
  UploadDocumentResponse,
  ListAssignedDto,
  ListQueueDto,
  RequestDetailView,
  RequestSummaryView,
  DocumentDownloadUrlView,
  ConfirmPaymentResponse,
  StartWorkflowResponse,
} from '@/types/request';
import { KeysetPage } from '@/types/shared';

export const requestKeys = {
  all: ['requests'] as const,

  /** Current user's own requests (keyset pagination). */
  mine: (limit?: number, cursor?: string) =>
    ['requests', 'mine', { limit, cursor }] as const,

  /** Requests assigned to current user (keyset pagination). */
  assigned: (params?: ListAssignedDto) =>
    ['requests', 'assigned', params ?? null] as const,

  /** Admin work queue (keyset pagination). */
  queue: (params: ListQueueDto) =>
    ['requests', 'queue', params] as const,

  /** Single request by UUID. */
  detail: (id: string) => ['requests', 'detail', id] as const,

  /** Single request by reference number. */
  byReference: (referenceNo: string) =>
    ['requests', 'by-reference', referenceNo] as const,

  /** Document download URL. */
  documentDownloadUrl: (requestId: string, documentId: string) =>
    ['requests', requestId, 'documents', documentId, 'download-url'] as const,
};

/**
 * Current user's requests (keyset pagination).
 * GET /requests/mine
 */
export function useMyRequests(limit?: number, cursor?: string) {
  return useQuery({
    queryKey: requestKeys.mine(limit, cursor),
    queryFn: () => requestsApi.getMine(limit, cursor),
  });
}

/**
 * Requests assigned to current user (keyset pagination).
 * GET /requests/assigned
 */
export function useAssignedRequests(params?: ListAssignedDto) {
  return useQuery({
    queryKey: requestKeys.assigned(params),
    queryFn: () => requestsApi.getAssigned(params),
  });
}

/**
 * Admin work queue (keyset pagination).
 * GET /requests/queue
 */
export function useRequestQueue(params: ListQueueDto) {
  return useQuery({
    queryKey: requestKeys.queue(params),
    queryFn: () => requestsApi.getQueue(params),
  });
}

/**
 * Request detail by UUID.
 * GET /requests/:id
 */
export function useRequest(id: string) {
  return useQuery({
    queryKey: requestKeys.detail(id),
    queryFn: () => requestsApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Request detail by reference number.
 * GET /requests/by-reference/:referenceNo
 */
export function useRequestByReference(referenceNo: string) {
  return useQuery({
    queryKey: requestKeys.byReference(referenceNo),
    queryFn: () => requestsApi.getByReference(referenceNo),
    enabled: !!referenceNo,
  });
}

/**
 * Document download URL (short-lived presigned URL).
 * GET /requests/:id/documents/:documentId/download-url
 *
 * Note: URL expires quickly — typically not cached long. Use with short
 * staleTime or manual refetch if the link expires.
 */
export function useDocumentDownloadUrl(
  requestId: string,
  documentId: string
) {
  return useQuery({
    queryKey: requestKeys.documentDownloadUrl(requestId, documentId),
    queryFn: () => requestsApi.getDocumentDownloadUrl(requestId, documentId),
    enabled: !!requestId && !!documentId,
    staleTime: 30_000, // 30 seconds — presigned URLs are short-lived
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Submit a new request.
 * POST /requests
 *
 * Invalidates:
 * - requestKeys.mine() — the new request appears in the user's list.
 */
export function useSubmitRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SubmitRequestDto) => requestsApi.submit(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.mine() });
    },
  });
}

/**
 * Classify request by model.
 * POST /requests/:id/classify/model
 *
 * Invalidates:
 * - requestKeys.detail(id) — the request's classification status/templateId changed.
 * - requestKeys.mine() / requestKeys.assigned() / requestKeys.queue() — the list views
 *   include classificationStatus, templateId, and stage which may have changed.
 */
export function useClassifyByModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      request,
    }: { id: string; request: ClassifyByModelDto }) =>
      requestsApi.classifyByModel(id, request),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.mine() });
      queryClient.invalidateQueries({ queryKey: requestKeys.assigned() });
      queryClient.invalidateQueries({ queryKey: ['requests', 'queue'] });
    },
  });
}

/**
 * Classify request by human (HITL resolver).
 * POST /requests/:id/classify/human
 *
 * Invalidates:
 * - requestKeys.detail(id) — classificationStatus, templateId, filledData changed.
 * - Same list invalidations as classifyByModel.
 */
export function useClassifyByHuman() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      request,
    }: { id: string; request: ClassifyByHumanDto }) =>
      requestsApi.classifyByHuman(id, request),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.mine() });
      queryClient.invalidateQueries({ queryKey: requestKeys.assigned() });
      queryClient.invalidateQueries({ queryKey: ['requests', 'queue'] });
    },
  });
}

/**
 * Change request priority.
 * PATCH /requests/:id/priority
 *
 * Invalidates:
 * - requestKeys.detail(id) — priority field changed.
 * - requestKeys.queue() — queue ordering depends on priority.
 * - requestKeys.mine() / requestKeys.assigned() — priority shown in list.
 */
export function useChangePriority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      request,
    }: { id: string; request: ChangePriorityDto }) =>
      requestsApi.changePriority(id, request),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.mine() });
      queryClient.invalidateQueries({ queryKey: requestKeys.assigned() });
      queryClient.invalidateQueries({ queryKey: ['requests', 'queue'] });
    },
  });
}

/**
 * Record extraction results (partial form fill by NLP extractor).
 * PATCH /requests/:id/filled-data
 *
 * Invalidates:
 * - requestKeys.detail(id) — filledData and missingRequiredFields changed.
 *   Lists (mine/assigned/queue) don't include filledData, so no need to invalidate them.
 */
export function useRecordExtraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      request,
    }: { id: string; request: RecordExtractionDto }) =>
      requestsApi.recordExtraction(id, request),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
    },
  });
}

/**
 * Confirm request (requester accepts or disputes proposed classification).
 * POST /requests/:id/confirm
 *
 * Invalidates:
 * - requestKeys.detail(id) — confirmedAt, stage, status changed.
 * - requestKeys.mine() / requestKeys.assigned() / requestKeys.queue() — stage/status shown in lists.
 */
export function useConfirmRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      request,
    }: { id: string; request: ConfirmRequestDto }) =>
      requestsApi.confirm(id, request),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.mine() });
      queryClient.invalidateQueries({ queryKey: requestKeys.assigned() });
      queryClient.invalidateQueries({ queryKey: ['requests', 'queue'] });
    },
  });
}

/**
 * Start request workflow (route onto template's active workflow path).
 * POST /requests/:id/start
 *
 * Invalidates:
 * - requestKeys.detail(id) — status, stepInstances, stage changed.
 * - requestKeys.mine() / requestKeys.assigned() / requestKeys.queue() — status/stage shown in lists.
 */
export function useStartWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requestsApi.start(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.mine() });
      queryClient.invalidateQueries({ queryKey: requestKeys.assigned() });
      queryClient.invalidateQueries({ queryKey: ['requests', 'queue'] });
    },
  });
}

/**
 * Confirm payment settled.
 * POST /requests/:id/payments/:paymentId/confirm
 *
 * Invalidates:
 * - requestKeys.detail(id) — payments array changed (status, settledAt).
 *   Lists don't show payment details, so only detail is invalidated.
 */
export function useConfirmPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      paymentId,
    }: { id: string; paymentId: string }) =>
      requestsApi.confirmPayment(id, paymentId),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
    },
  });
}

/**
 * Waive payment.
 * POST /requests/:id/payments/:paymentId/waive
 *
 * Invalidates:
 * - requestKeys.detail(id) — payments array changed (status, waiverReason, settledAt).
 */
export function useWaivePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      paymentId,
      request,
    }: { id: string; paymentId: string; request: WaivePaymentDto }) =>
      requestsApi.waivePayment(id, paymentId, request),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
    },
  });
}

/**
 * Assign step to a user.
 * POST /requests/:id/steps/:stepId/assign
 *
 * Invalidates:
 * - requestKeys.detail(id) — stepInstances[].assignedToUserId changed.
 * - requestKeys.assigned() — the assigned user's list now includes this request.
 * - requestKeys.mine() — if the current user is the assignee, their list changes.
 */
export function useAssignStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      stepId,
      request,
    }: { id: string; stepId: string; request: AssignStepDto }) =>
      requestsApi.assignStep(id, stepId, request),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.assigned() });
      queryClient.invalidateQueries({ queryKey: requestKeys.mine() });
    },
  });
}

/**
 * Act on step (start, complete, reject, skip).
 * POST /requests/:id/steps/:stepId/actions
 *
 * Invalidates:
 * - requestKeys.detail(id) — stepInstances[].status, request.status, stage changed.
 * - requestKeys.assigned() — completing a step may unassign it; starting may reassign via handoff.
 * - requestKeys.mine() — same logic for current user.
 * - requestKeys.queue() — request status/stage may have changed (e.g., completed).
 */
export function useActOnStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      stepId,
      request,
    }: { id: string; stepId: string; request: ActOnStepDto }) =>
      requestsApi.actOnStep(id, stepId, request),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.mine() });
      queryClient.invalidateQueries({ queryKey: requestKeys.assigned() });
      queryClient.invalidateQueries({ queryKey: ['requests', 'queue'] });
    },
  });
}

/**
 * Upload document to request.
 * POST /requests/:id/documents
 *
 * Invalidates:
 * - requestKeys.detail(id) — documents array changed.
 *   Lists don't include documents, so no list invalidation needed.
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      request,
    }: { id: string; request: UploadDocumentDto }) =>
      requestsApi.uploadDocument(id, request),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
    },
  });
}