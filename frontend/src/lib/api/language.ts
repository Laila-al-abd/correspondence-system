import apiClient from './axios-client';
import { LanguageView, CreateLanguageDto, CreateLanguageResponse } from '@/types/catalog';


/**
 * All methods here reject with `ApiError` (src/types/shared.ts) on failure —
 * axios-client's response interceptor normalizes it before it gets here.
 * Callers should catch ApiError and branch on `.code`, not `.message`.
 */
export const languageApi = {
  /**
   * List all languages.
   * GET /languages
   */
  getAll: async (onlyEnabled?: boolean): Promise<LanguageView[]> => {
    const { data } = await apiClient.get<LanguageView[]>('/languages', {
      params: {
        onlyEnabled: onlyEnabled ?? undefined,
      },
    });
    return data;
  },

  /**
   * Create a new language.
   * POST /languages
   */
  create: async (request: CreateLanguageDto): Promise<CreateLanguageResponse> => {
    const { data } = await apiClient.post<CreateLanguageResponse>('/languages', request);
    return data;
  },
};