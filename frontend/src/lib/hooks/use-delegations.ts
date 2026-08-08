// src/lib/hooks/use-delegations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { delegationsApi } from '@/lib/api/delegations';
import { GrantDelegationDto, DelegationView } from '@/types/identity';
import { OffsetPage } from '@/types/shared';

export const delegationKeys = {
  all: ['delegations'] as const,
  list: (params: {
    page: number;
    pageSize: number;
    delegatorId?: string;
    delegateId?: string;
    activeOnly?: boolean;
    onDate?: string;
  }) => ['delegations', 'list', params] as const,
  detail: (id: string) => ['delegations', id] as const,
};

/**
 * Paginated list of delegations with optional filters.
 * GET /delegations
 *
 * Page is 1-based (converted to offset internally by the API).
 */
export function useDelegations(
  page = 1,
  pageSize = 50,
  delegatorId?: string,
  delegateId?: string,
  activeOnly?: boolean,
  onDate?: string
) {
  const params = { page, pageSize, delegatorId, delegateId, activeOnly, onDate };
  return useQuery({
    queryKey: delegationKeys.list(params),
    queryFn: () => delegationsApi.getAll(page, pageSize, delegatorId, delegateId, activeOnly, onDate),
  });
}

/**
 * Single delegation by ID.
 * GET /delegations/:id
 */
export function useDelegation(id: string) {
  return useQuery({
    queryKey: delegationKeys.detail(id),
    queryFn: () => delegationsApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Grant a new delegation.
 * POST /delegations
 *
 * Invalidates:
 * - delegationKeys.all — the list of delegations changed.
 */
export function useGrantDelegation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: GrantDelegationDto) => delegationsApi.grant(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: delegationKeys.all });
    },
  });
}

/**
 * Revoke (reclaim) a delegation.
 * POST /delegations/:id/revoke
 *
 * Invalidates:
 * - delegationKeys.all — the list of delegations changed.
 * - delegationKeys.detail(id) — the specific delegation's status changed.
 */
export function useRevokeDelegation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => delegationsApi.revoke(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: delegationKeys.all });
      queryClient.invalidateQueries({ queryKey: delegationKeys.detail(id) });
    },
  });
}