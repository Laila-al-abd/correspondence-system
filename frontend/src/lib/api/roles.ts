import apiClient from './axios-client';
import {
  CreateRoleDto,
  UpdateRoleDto,
  GrantPermissionDto,
  RoleSummaryView,
  RoleDetailView,
  PermissionGroupView,
  CreateRoleResponse,
} from '@/types/identity';


/**
 * All methods here reject with `ApiError` (src/types/shared.ts) on failure —
 * axios-client's response interceptor normalizes it before it gets here.
 * Callers should catch ApiError and branch on `.code`, not `.message`.
 */
export const rolesApi = {
  /**
   * List all roles.
   * GET /roles
   */
  getAll: async (): Promise<RoleSummaryView[]> => {
    const { data } = await apiClient.get<RoleSummaryView[]>('/roles');
    return data;
  },

  /**
   * Get all permission groups with their permissions.
   * GET /roles/permissions
   */
  getPermissions: async (): Promise<PermissionGroupView[]> => {
    const { data } = await apiClient.get<PermissionGroupView[]>('/roles/permissions');
    return data;
  },

  /**
   * Get a single role by ID.
   * GET /roles/:roleId
   */
  getById: async (roleId: string): Promise<RoleDetailView> => {
    const { data } = await apiClient.get<RoleDetailView>(`/roles/${roleId}`);
    return data;
  },

  /**
   * Create a new role.
   * POST /roles
   */
  create: async (request: CreateRoleDto): Promise<CreateRoleResponse> => {
    const { data } = await apiClient.post<CreateRoleResponse>('/roles', request);
    return data;
  },

  /**
   * Update a role.
   * PATCH /roles/:roleId
   */
  update: async (roleId: string, request: UpdateRoleDto): Promise<void> => {
    await apiClient.patch(`/roles/${roleId}`, request);
  },

  /**
   * Delete (retire) a role.
   * DELETE /roles/:roleId
   */
  remove: async (roleId: string): Promise<void> => {
    await apiClient.delete(`/roles/${roleId}`);
  },

  /**
   * Grant a permission to a role.
   * POST /roles/:roleId/permissions
   */
  grantPermission: async (roleId: string, request: GrantPermissionDto): Promise<void> => {
    await apiClient.post(`/roles/${roleId}/permissions`, request);
  },

  /**
   * Revoke a permission from a role.
   * DELETE /roles/:roleId/permissions/:code
   */
  revokePermission: async (roleId: string, code: string): Promise<void> => {
    await apiClient.delete(`/roles/${roleId}/permissions/${code}`);
  },
};