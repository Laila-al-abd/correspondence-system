import apiClient from './axios-client';
import {
  GrantDelegationDto,
  DelegationView,
} from '@/types/identity';
import { OffsetPage } from '@/types/shared';
/**
 * All methods here reject with `ApiError` (src/types/shared.ts) on failure —
 * axios-client's response interceptor normalizes it before it gets here.
 * Callers should catch ApiError and branch on `.code`, not `.message`.
 */
export const delegationsApi = {
  /**
   * List delegations with pagination and filters.
   * GET /delegations
   */
  getAll: async (
    page = 1,
    pageSize = 50,
    delegatorId?: string,
    delegateId?: string,
    activeOnly?: boolean,
    onDate?: string,
  ): Promise<OffsetPage<DelegationView>> => {
    // Convert 1-based page to zero-based offset
    const offset = (page - 1) * pageSize;
    const { data } = await apiClient.get<OffsetPage<DelegationView>>('/delegations', {
      params: {
        limit: pageSize,
        offset,
        delegatorId: delegatorId ?? undefined,
        delegateId: delegateId ?? undefined,
        activeOnly: activeOnly !== undefined ? String(activeOnly) : undefined,
        onDate: onDate ?? undefined,
      },
    });
    return data;
  },

  /**
   * Get a single delegation by ID.
   * GET /delegations/:id
   */
  getById: async (id: string): Promise<DelegationView> => {
    const { data } = await apiClient.get<DelegationView>(`/delegations/${id}`);
    return data;
  },

  /**
   * Grant a new delegation.
   * POST /delegations
   */
  grant: async (request: GrantDelegationDto): Promise<DelegationView> => {
    const { data } = await apiClient.post<DelegationView>('/delegations', request);
    return data;
  },

  /**
   * Revoke a delegation.
   * POST /delegations/:id/revoke
   */
  revoke: async (id: string): Promise<DelegationView> => {
    const { data } = await apiClient.post<DelegationView>(`/delegations/${id}/revoke`);
    return data;
  },
};