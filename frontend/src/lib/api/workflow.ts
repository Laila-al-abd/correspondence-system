import apiClient from './axios-client';
import {
  DefineWorkflowPathDto,
  DefineWorkflowPathResponse,
  ActivateWorkflowPathResponse,
  DeactivateWorkflowPathResponse,
  WorkflowPathView,
} from '@/types/workflow';
/**
 * All methods here reject with `ApiError` (src/types/shared.ts) on failure —
 * axios-client's response interceptor normalizes it before it gets here.
 * Callers should catch ApiError and branch on `.code`, not `.message`.
 */
export const workflowApi = {
  /**
   * List workflow paths by template.
   * GET /workflow-paths
   */
  getAll: async (templateId: string): Promise<WorkflowPathView[]> => {
    const { data } = await apiClient.get<WorkflowPathView[]>('/workflow-paths', {
      params: { templateId },
    });
    return data;
  },

  /**
   * Get a single workflow path by ID.
   * GET /workflow-paths/:id
   */
  getById: async (id: string): Promise<WorkflowPathView> => {
    const { data } = await apiClient.get<WorkflowPathView>(`/workflow-paths/${id}`);
    return data;
  },

  /**
   * Define a new workflow path.
   * POST /workflow-paths
   */
  define: async (request: DefineWorkflowPathDto): Promise<DefineWorkflowPathResponse> => {
    const { data } = await apiClient.post<DefineWorkflowPathResponse>('/workflow-paths', request);
    return data;
  },

  /**
   * Activate a workflow path.
   * POST /workflow-paths/:id/activate
   */
  activate: async (id: string): Promise<ActivateWorkflowPathResponse> => {
    const { data } = await apiClient.post<ActivateWorkflowPathResponse>(
      `/workflow-paths/${id}/activate`
    );
    return data;
  },

  /**
   * Deactivate a workflow path.
   * POST /workflow-paths/:id/deactivate
   */
  deactivate: async (id: string): Promise<DeactivateWorkflowPathResponse> => {
    const { data } = await apiClient.post<DeactivateWorkflowPathResponse>(
      `/workflow-paths/${id}/deactivate`
    );
    return data;
  },
};