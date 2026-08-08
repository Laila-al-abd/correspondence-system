// src/lib/hooks/use-workflow.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '@/lib/api/workflow';
import {
  DefineWorkflowPathDto,
  DefineWorkflowPathResponse,
  ActivateWorkflowPathResponse,
  DeactivateWorkflowPathResponse,
  WorkflowPathView,
} from '@/types/workflow';

export const workflowKeys = {
  all: ['workflow-paths'] as const,
  list: (templateId: string) => ['workflow-paths', 'list', templateId] as const,
  detail: (id: string) => ['workflow-paths', id] as const,
};

/**
 * All workflow paths for a template.
 * GET /workflow-paths?templateId=:templateId
 */
export function useWorkflowPaths(templateId: string) {
  return useQuery({
    queryKey: workflowKeys.list(templateId),
    queryFn: () => workflowApi.getAll(templateId),
    enabled: !!templateId,
  });
}

/**
 * Single workflow path by ID.
 * GET /workflow-paths/:id
 */
export function useWorkflowPath(id: string) {
  return useQuery({
    queryKey: workflowKeys.detail(id),
    queryFn: () => workflowApi.getById(id),
    enabled: !!id,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Define a new workflow path for a template.
 * POST /workflow-paths
 *
 * Invalidates:
 * - workflowKeys.list(templateId) — the new path appears in the template's list.
 *   We need the templateId from the request to invalidate correctly.
 */
export function useDefineWorkflowPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DefineWorkflowPathDto) => workflowApi.define(request),
    onSuccess: (_data, request) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.list(request.templateId) });
    },
  });
}

/**
 * Activate a workflow path (make it the default for its template).
 * POST /workflow-paths/:id/activate
 *
 * Invalidates:
 * - workflowKeys.list(templateId) — the template's active path changed.
 *   Since we don't have templateId in the mutation callback, we invalidate
 *   all lists conservatively.
 * - workflowKeys.detail(id) — the specific path's isActive changed.
 */
export function useActivateWorkflowPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workflowApi.activate(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.all });
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(id) });
    },
  });
}

/**
 * Deactivate a workflow path.
 * POST /workflow-paths/:id/deactivate
 *
 * Invalidates:
 * - workflowKeys.all — the template's active path changed.
 * - workflowKeys.detail(id) — the specific path's isActive changed.
 */
export function useDeactivateWorkflowPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workflowApi.deactivate(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.all });
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(id) });
    },
  });
}