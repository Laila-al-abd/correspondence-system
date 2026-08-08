import apiClient from './axios-client';
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
/**
 * All methods here reject with `ApiError` (src/types/shared.ts) on failure —
 * axios-client's response interceptor normalizes it before it gets here.
 * Callers should catch ApiError and branch on `.code`, not `.message`.
 */
export const requestsApi = {
  // ----- reads -----

  /**
   * Get current user's requests (keyset pagination).
   * GET /requests/mine
   */
  getMine: async (
    limit?: number,
    cursor?: string
  ): Promise<KeysetPage<RequestSummaryView>> => {
    const { data } = await apiClient.get<KeysetPage<RequestSummaryView>>('/requests/mine', {
      params: {
        limit: limit ?? undefined,
        cursor: cursor ?? undefined,
      },
    });
    return data;
  },

  /**
   * Get requests assigned to current user (keyset pagination).
   * GET /requests/assigned
   */
  getAssigned: async (
    params?: ListAssignedDto
  ): Promise<KeysetPage<RequestSummaryView>> => {
    const { data } = await apiClient.get<KeysetPage<RequestSummaryView>>('/requests/assigned', {
      params: {
        ready: params?.ready ?? undefined,
        limit: params?.limit ?? undefined,
        cursor: params?.cursor ?? undefined,
      },
    });
    return data;
  },

  /**
   * Get request queue (admin, keyset pagination).
   * GET /requests/queue
   */
  getQueue: async (
    params: ListQueueDto
  ): Promise<KeysetPage<RequestSummaryView>> => {
    const { data } = await apiClient.get<KeysetPage<RequestSummaryView>>('/requests/queue', {
      params: {
        status: params.status,
        classificationStatus: params.classificationStatus ?? undefined,
        hasFilledData: params.hasFilledData ?? undefined,
        extracted: params.extracted ?? undefined,
        limit: params.limit ?? undefined,
        cursor: params.cursor ?? undefined,
      },
    });
    return data;
  },

  /**
   * Get request by reference number.
   * GET /requests/by-reference/:referenceNo
   */
  getByReference: async (referenceNo: string): Promise<RequestDetailView> => {
    const { data } = await apiClient.get<RequestDetailView>(
      `/requests/by-reference/${referenceNo}`
    );
    return data;
  },

  /**
   * Get request by ID.
   * GET /requests/:id
   */
  getById: async (id: string): Promise<RequestDetailView> => {
    const { data } = await apiClient.get<RequestDetailView>(`/requests/${id}`);
    return data;
  },

  /**
   * Get document download URL.
   * GET /requests/:id/documents/:documentId/download-url
   */
  getDocumentDownloadUrl: async (
    id: string,
    documentId: string
  ): Promise<DocumentDownloadUrlView> => {
    const { data } = await apiClient.get<DocumentDownloadUrlView>(
      `/requests/${id}/documents/${documentId}/download-url`
    );
    return data;
  },

  // ----- writes -----

  /**
   * Submit a new request.
   * POST /requests
   */
  submit: async (request: SubmitRequestDto): Promise<SubmitRequestResponse> => {
    const { data } = await apiClient.post<SubmitRequestResponse>('/requests', request);
    return data;
  },

  /**
   * Classify request by model.
   * POST /requests/:id/classify/model
   */
  classifyByModel: async (
    id: string,
    request: ClassifyByModelDto
  ): Promise<ClassifyByModelResponse> => {
    const { data } = await apiClient.post<ClassifyByModelResponse>(
      `/requests/${id}/classify/model`,
      request
    );
    return data;
  },

  /**
   * Classify request by human.
   * POST /requests/:id/classify/human
   */
  classifyByHuman: async (
    id: string,
    request: ClassifyByHumanDto
  ): Promise<ClassifyByHumanResponse> => {
    const { data } = await apiClient.post<ClassifyByHumanResponse>(
      `/requests/${id}/classify/human`,
      request
    );
    return data;
  },

  /**
   * Change request priority.
   * PATCH /requests/:id/priority
   */
  changePriority: async (
    id: string,
    request: ChangePriorityDto
  ): Promise<ChangePriorityResponse> => {
    const { data } = await apiClient.patch<ChangePriorityResponse>(
      `/requests/${id}/priority`,
      request
    );
    return data;
  },

  /**
   * Record extraction results (PATCH for partial update).
   * PATCH /requests/:id/filled-data
   */
  recordExtraction: async (
    id: string,
    request: RecordExtractionDto
  ): Promise<RecordExtractionResponse> => {
    const { data } = await apiClient.patch<RecordExtractionResponse>(
      `/requests/${id}/filled-data`,
      request
    );
    return data;
  },

  /**
   * Confirm request (requester accepts/rejects proposed classification).
   * POST /requests/:id/confirm
   */
  confirm: async (
    id: string,
    request: ConfirmRequestDto
  ): Promise<ConfirmRequestResponse> => {
    const { data } = await apiClient.post<ConfirmRequestResponse>(
      `/requests/${id}/confirm`,
      request
    );
    return data;
  },

  /**
   * Start request workflow.
   * POST /requests/:id/start
   */
  start: async (id: string): Promise<StartWorkflowResponse> => {
    const { data } = await apiClient.post<StartWorkflowResponse>(`/requests/${id}/start`);
    return data;
  },

  /**
   * Confirm payment settled.
   * POST /requests/:id/payments/:paymentId/confirm
   */
  confirmPayment: async (
    id: string,
    paymentId: string
  ): Promise<ConfirmPaymentResponse> => {
    const { data } = await apiClient.post<ConfirmPaymentResponse>(
      `/requests/${id}/payments/${paymentId}/confirm`
    );
    return data;
  },

  /**
   * Waive payment.
   * POST /requests/:id/payments/:paymentId/waive
   */
  waivePayment: async (
    id: string,
    paymentId: string,
    request: WaivePaymentDto
  ): Promise<WaivePaymentResponse> => {
    const { data } = await apiClient.post<WaivePaymentResponse>(
      `/requests/${id}/payments/${paymentId}/waive`,
      request
    );
    return data;
  },

  /**
   * Assign step to user.
   * POST /requests/:id/steps/:stepId/assign
   */
  assignStep: async (
    id: string,
    stepId: string,
    request: AssignStepDto
  ): Promise<AssignStepResponse> => {
    const { data } = await apiClient.post<AssignStepResponse>(
      `/requests/${id}/steps/${stepId}/assign`,
      request
    );
    return data;
  },

  /**
   * Act on step (start, complete, reject, skip).
   * POST /requests/:id/steps/:stepId/actions
   */
  actOnStep: async (
    id: string,
    stepId: string,
    request: ActOnStepDto
  ): Promise<ActOnStepResponse> => {
    const { data } = await apiClient.post<ActOnStepResponse>(
      `/requests/${id}/steps/${stepId}/actions`,
      request
    );
    return data;
  },

  /**
   * Upload document to request.
   * POST /requests/:id/documents
   */
  uploadDocument: async (
    id: string,
    request: UploadDocumentDto
  ): Promise<UploadDocumentResponse> => {
    const { data } = await apiClient.post<UploadDocumentResponse>(
      `/requests/${id}/documents`,
      request
    );
    return data;
  },
};