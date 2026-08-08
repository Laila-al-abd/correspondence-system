// src/lib/hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
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

export const userKeys = {
  all: ['users'] as const,
  list: (params: {
    page: number;
    pageSize: number;
    search?: string;
    userType?: string;
    status?: UserStatus | string;
    departmentId?: string;
  }) => ['users', 'list', params] as const,
  detail: (userId: string) => ['users', userId] as const,
};

/**
 * Paginated list of users (admin directory).
 * GET /users
 *
 * Page is 1-based (converted to offset internally by the API).
 */
export function useUsers(
  page = 1,
  pageSize = 50,
  search?: string,
  userType?: string,
  status?: UserStatus | string,
  departmentId?: string
) {
  const params = { page, pageSize, search, userType, status, departmentId };
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.getAll(page, pageSize, search, userType, status, departmentId),
  });
}

/**
 * Single user by ID with roles and attributes.
 * GET /users/:userId
 */
export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => usersApi.getById(userId),
    enabled: !!userId,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Provision a member of staff or a student.
 * POST /users
 *
 * Invalidates:
 * - userKeys.all — the new user appears in the list.
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateUserDto) => usersApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

/**
 * Import people from the external personnel directory.
 * POST /users/sync
 *
 * Invalidates:
 * - userKeys.all — synced users added/updated in the list.
 */
export function useSyncUsersFromDirectory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (source?: string) => usersApi.syncFromDirectory(source),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

/**
 * Grant a role to a user, optionally scoped to a department and optionally expiring.
 * POST /users/:userId/roles
 *
 * Invalidates:
 * - userKeys.detail(userId) — the user's roles array changed.
 * - userKeys.all — list shows role-related info (though currently ListUsersResult
 *   doesn't include roles, so list invalidation is conservative).
 */
export function useAssignRole(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AssignRoleDto) => usersApi.assignRole(userId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

/**
 * Revoke a role from a user.
 * DELETE /users/:userId/roles/:roleId
 *
 * Invalidates:
 * - userKeys.detail(userId) — the user's roles array changed.
 * - userKeys.all — conservative, same as assign.
 */
export function useRevokeRole(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => usersApi.revokeRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

/**
 * Set a user's ABAC attribute value.
 * PUT /users/:userId/attributes
 *
 * Invalidates:
 * - userKeys.detail(userId) — the user's attributes array changed.
 *   Lists don't include attributes, so no list invalidation needed.
 */
export function useSetUserAttribute(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SetUserAttributeDto) =>
      usersApi.setAttribute(userId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
    },
  });
}

/**
 * Clear a user's ABAC attribute.
 * DELETE /users/:userId/attributes/:attributeCode
 *
 * Invalidates:
 * - userKeys.detail(userId) — the user's attributes array changed.
 */
export function useClearUserAttribute(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attributeCode: string) =>
      usersApi.clearAttribute(userId, attributeCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
    },
  });
}