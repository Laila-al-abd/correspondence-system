import apiClient from './axios-client';
import {
  CreateUserDto,
  AssignRoleDto,
  SetUserAttributeDto,
  UserDetailView,
  ListUsersResult,
  UserStatus,
  CreatedUserResponse,
  SyncUsersResponse,
  AssignRoleResult,
  SetUserAttributeResult,
} from '@/types/identity';



export const usersApi = {
  /**
   * List/search users with pagination (admin directory).
   * GET /users
   */
  getAll: async (
    page = 1,
    pageSize = 50,
    search?: string,
    userType?: string,
    status?: UserStatus | string,
    departmentId?: string,
  ): Promise<ListUsersResult> => {
    // Convert 1-based page to zero-based offset
    const offset = (page - 1) * pageSize;
    const { data } = await apiClient.get<ListUsersResult>('/users', {
      params: {
        limit: pageSize,
        offset,
        search: search ?? undefined,
        userType: userType ?? undefined,
        status: status ?? undefined,
        departmentId: departmentId ?? undefined,
      },
    });
    return data;
  },

  /**
   * Get a single user by ID with roles and attributes.
   * GET /users/:userId
   */
  getById: async (userId: string): Promise<UserDetailView> => {
    const { data } = await apiClient.get<UserDetailView>(`/users/${userId}`);
    return data;
  },

  /**
   * Provision a member of staff or a student.
   * POST /users
   */
  create: async (request: CreateUserDto): Promise<CreatedUserResponse> => {
    const { data } = await apiClient.post<CreatedUserResponse>('/users', request);
    return data;
  },

  /**
   * Import people from the external personnel directory.
   * POST /users/sync
   */
  syncFromDirectory: async (source?: string): Promise<SyncUsersResponse> => {
    const { data } = await apiClient.post<SyncUsersResponse>('/users/sync', null, {
      params: { source: source ?? undefined },
    });
    return data;
  },

  /**
   * Grant a role to a user, optionally scoped to a department and optionally expiring.
   * POST /users/:userId/roles
   */
  assignRole: async (userId: string, request: AssignRoleDto): Promise<AssignRoleResult> => {
    const { data } = await apiClient.post<AssignRoleResult>(`/users/${userId}/roles`, request);
    return data;
  },

  /**
   * Revoke a role from a user.
   * DELETE /users/:userId/roles/:roleId
   */
  revokeRole: async (userId: string, roleId: string, departmentId?: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}/roles/${roleId}`, {
      params: { departmentId: departmentId ?? undefined },
    });
  },

  /**
   * Set a user's ABAC attribute value.
   * PUT /users/:userId/attributes
   */
  setAttribute: async (userId: string, request: SetUserAttributeDto): Promise<SetUserAttributeResult> => {
    const { data } = await apiClient.put<SetUserAttributeResult>(`/users/${userId}/attributes`, request);
    return data;
  },

  /**
   * Clear a user's ABAC attribute.
   * DELETE /users/:userId/attributes/:attributeCode
   */
  clearAttribute: async (userId: string, attributeCode: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}/attributes/${attributeCode}`);
  },
};