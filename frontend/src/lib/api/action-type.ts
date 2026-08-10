import apiClient from './axios-client';
import { ActionTypeView } from '@/types/catalog';


/**
 * All methods here reject with `ApiError` (src/types/shared.ts) on failure —
 * axios-client's response interceptor normalizes it before it gets here.
 * Callers should catch ApiError and branch on `.code`, not `.message`.
 */
export const actionTypeApi = {
  /**
   * List all action types.
   * GET /action-types
   */
  getAll: async (onlyTerminal?: boolean): Promise<ActionTypeView[]> => {
    const { data } = await apiClient.get<ActionTypeView[]>('/action-types', {
      params: {
        onlyTerminal: onlyTerminal ?? undefined,
      },
    });
    return data;
  },
};