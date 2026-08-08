// src/lib/hooks/use-auth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { identityApi } from '@/lib/api/auth';
import {
  RegisterUserDto,
  LoginDto,
  LoginResponse,
  RegisterResponse,
  EffectivePermissionsResponse,
} from '@/types/identity';

export const authKeys = {
  all: ['auth'] as const,

  /** Effective permissions for the currently authenticated user. */
  myPermissions: () => ['auth', 'me', 'permissions'] as const,
};

/**
 * Public self-registration for external applicants.
 * POST /auth/register
 *
 * Always returns 202 with a fixed message; the email existence check happens
 * asynchronously. No query cache to invalidate — registration doesn't change
 * any existing read data.
 */
export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RegisterUserDto) => identityApi.register(dto),
    // No invalidation needed — registration is a fire-and-forget action
    // that doesn't affect existing cached data.
  });
}

/**
 * User login — authenticates and stores the access token in the auth cookie.
 * POST /auth/login
 *
 * Invalidates:
 * - authKeys.all — login establishes a new auth context, so all auth-related
 *   queries (myPermissions, potentially user profile, etc.) should refetch.
 * - Note: this intentionally invalidates broadly because a different user
 *   logging in completely changes what data is accessible.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: LoginDto) => identityApi.login(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

/**
 * Effective permission codes for the currently authenticated user.
 * GET /auth/me/permissions
 *
 * Only enabled when there's an auth token present (handled by the query
 * returning 401 and the axios interceptor clearing the cookie — but we can
 * also gate it with a global auth state if the app has one).
 */
export function useMyPermissions() {
  return useQuery({
    queryKey: authKeys.myPermissions(),
    queryFn: () => identityApi.getMyPermissions(),
  });
}