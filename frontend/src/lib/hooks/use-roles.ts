// src/lib/hooks/use-roles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '@/lib/api/roles';
import {
  CreateRoleDto,
  UpdateRoleDto,
  GrantPermissionDto,
  RoleSummaryView,
  RoleDetailView,
  PermissionGroupView,
  CreateRoleResponse,
} from '@/types/identity';

export const roleKeys = {
  all: ['roles'] as const,
  list: () => ['roles', 'list'] as const,
  permissions: () => ['roles', 'permissions'] as const,
  detail: (roleId: string) => ['roles', roleId] as const,
};

/**
 * All roles (flat list, no pagination).
 * GET /roles
 */
export function useRoles() {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: () => rolesApi.getAll(),
  });
}

/**
 * All permission groups with their permissions.
 * GET /roles/permissions
 */
export function usePermissionGroups() {
  return useQuery({
    queryKey: roleKeys.permissions(),
    queryFn: () => rolesApi.getPermissions(),
  });
}

/**
 * Single role by ID.
 * GET /roles/:roleId
 */
export function useRole(roleId: string) {
  return useQuery({
    queryKey: roleKeys.detail(roleId),
    queryFn: () => rolesApi.getById(roleId),
    enabled: !!roleId,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new role.
 * POST /roles
 *
 * Invalidates:
 * - roleKeys.list() — the new role appears in the list.
 * - roleKeys.permissions() — if the role was created with permissions, the
 *   permission groups may now include it (though the groups themselves don't
 *   list roles, the permission counts could change).
 */
export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateRoleDto) => rolesApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.list() });
      queryClient.invalidateQueries({ queryKey: roleKeys.permissions() });
    },
  });
}

/**
 * Update a role (name, description).
 * PATCH /roles/:roleId
 *
 * Invalidates:
 * - roleKeys.list() — list shows name, description.
 * - roleKeys.detail(roleId) — the updated role detail.
 */
export function useUpdateRole(roleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateRoleDto) => rolesApi.update(roleId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.list() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) });
    },
  });
}

/**
 * Delete (retire) a role.
 * DELETE /roles/:roleId
 *
 * Invalidates:
 * - roleKeys.list() — role removed from list.
 * - roleKeys.detail(roleId) — role detail no longer exists.
 * - roleKeys.permissions() — permission counts per group may change.
 */
export function useRemoveRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => rolesApi.remove(roleId),
    onSuccess: (_data, roleId) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.list() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.permissions() });
    },
  });
}

/**
 * Grant a permission to a role.
 * POST /roles/:roleId/permissions
 *
 * Invalidates:
 * - roleKeys.detail(roleId) — the role's permissions array changed.
 * - roleKeys.list() — list shows permissionCount.
 * - roleKeys.permissions() — permission groups now have different counts.
 */
export function useGrantRolePermission(roleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: GrantPermissionDto) =>
      rolesApi.grantPermission(roleId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.list() });
      queryClient.invalidateQueries({ queryKey: roleKeys.permissions() });
    },
  });
}

/**
 * Revoke a permission from a role.
 * DELETE /roles/:roleId/permissions/:code
 *
 * Invalidates:
 * - roleKeys.detail(roleId) — the role's permissions array changed.
 * - roleKeys.list() — list shows permissionCount.
 * - roleKeys.permissions() — permission groups now have different counts.
 */
export function useRevokeRolePermission(roleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => rolesApi.revokePermission(roleId, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.list() });
      queryClient.invalidateQueries({ queryKey: roleKeys.permissions() });
    },
  });
}