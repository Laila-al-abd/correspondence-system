// src/lib/hooks/use-organization.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '@/lib/api/organization';
import {
  SyncDepartmentsDto,
  CreateDepartmentDto,
  ListDepartmentsDto,
  DepartmentView,
  DepartmentTreeNode,
  CreateDepartmentResult,
  SyncDepartmentsResult,
} from '@/types/organization';
import { OffsetPage } from '@/types/shared';

export const organizationKeys = {
  all: ['organization'] as const,
  list: (params?: ListDepartmentsDto) =>
    ['organization', 'departments', 'list', params ?? null] as const,
  tree: (activeOnly?: boolean) =>
    ['organization', 'departments', 'tree', activeOnly ?? null] as const,
  detail: (id: string) => ['organization', 'departments', id] as const,
};

/**
 * Sync departments from external directory.
 * POST /organization/departments/sync
 *
 * Invalidates:
 * - organizationKeys.all — the department data changed (created, updated, deactivated).
 */
export function useSyncDepartments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (source?: string) => organizationApi.sync(source),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
}

/**
 * Create a new department.
 * POST /organization/departments
 *
 * Invalidates:
 * - organizationKeys.all — the list of departments changed.
 */
export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateDepartmentDto) => organizationApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
}

/**
 * Paginated list of departments with optional filters.
 * GET /organization/departments
 *
 * Uses zero-based offset and limit (as per backend contract).
 */
export function useDepartments(params?: ListDepartmentsDto) {
  return useQuery({
    queryKey: organizationKeys.list(params),
    queryFn: () => organizationApi.getAll(params),
  });
}

/**
 * Department hierarchy tree (full nested structure).
 * GET /organization/departments/tree
 */
export function useDepartmentTree(activeOnly?: boolean) {
  return useQuery({
    queryKey: organizationKeys.tree(activeOnly),
    queryFn: () => organizationApi.getTree(activeOnly),
  });
}

/**
 * Single department by ID.
 * GET /organization/departments/:id
 */
export function useDepartment(id: string) {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: () => organizationApi.getById(id),
    enabled: !!id,
  });
}