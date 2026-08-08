import apiClient from './axios-client';
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


/**
 * All methods here reject with `ApiError` (src/types/shared.ts) on failure —
 * axios-client's response interceptor normalizes it before it gets here.
 * Callers should catch ApiError and branch on `.code`, not `.message`.
 */
export const organizationApi = {
  /**
   * Sync departments from external directory.
   * POST /organization/departments/sync
   */
  sync: async (source?: string): Promise<SyncDepartmentsResult> => {
    const { data } = await apiClient.post<SyncDepartmentsResult>(
      '/organization/departments/sync',
      { source: source ?? undefined }
    );
    return data;
  },

  /**
   * Create a new department.
   * POST /organization/departments
   */
  create: async (request: CreateDepartmentDto): Promise<CreateDepartmentResult> => {
    const { data } = await apiClient.post<CreateDepartmentResult>(
      '/organization/departments',
      request
    );
    return data;
  },

  /**
   * Get paginated list of departments.
   * GET /organization/departments
   */
  getAll: async (
    params?: ListDepartmentsDto
  ): Promise<OffsetPage<DepartmentView>> => {
    const { data } = await apiClient.get<OffsetPage<DepartmentView>>(
      '/organization/departments',
      {
        params: {
          search: params?.search ?? undefined,
          parentId: params?.parentId ?? undefined,
          activeOnly: params?.activeOnly ?? undefined,
          limit: params?.limit ?? undefined,
          offset: params?.offset ?? undefined,
        },
      }
    );
    return data;
  },

  /**
   * Get department hierarchy tree.
   * GET /organization/departments/tree
   */
  getTree: async (activeOnly?: boolean): Promise<DepartmentTreeNode[]> => {
    const { data } = await apiClient.get<DepartmentTreeNode[]>('/organization/departments/tree', {
      params: {
        activeOnly: activeOnly ?? undefined,
      },
    });
    return data;
  },

  /**
   * Get a single department by ID.
   * GET /organization/departments/:id
   */
  getById: async (id: string): Promise<DepartmentView> => {
    const { data } = await apiClient.get<DepartmentView>(
      `/organization/departments/${id}`
    );
    return data;
  },
};