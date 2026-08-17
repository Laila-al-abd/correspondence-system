// src/lib/api/settings.ts
//
// Administrable system settings.
//   GET /settings          -> the keys this build supports
//   GET /settings/:key     -> the value in force (with configured: false when defaulted)
//   PUT /settings/:key     -> replace the value
//
// All three require `system.monitor`.
//
// Rejects with ApiError (src/types/shared.ts); axios-client's interceptor
// normalizes the payload before it reaches here, so callers branch on `.code`.

import apiClient from './axios-client';
import { SettingKeyView, SettingView } from '@/types/settings';

export const settingsApi = {
  /** The editable keys, served from the backend registry rather than the table. */
  listKeys: async (): Promise<SettingKeyView[]> => {
    const { data } = await apiClient.get<SettingKeyView[]>('/settings');
    return data;
  },

  getOne: async (key: string): Promise<SettingView> => {
    const { data } = await apiClient.get<SettingView>(
      `/settings/${encodeURIComponent(key)}`,
    );
    return data;
  },

  /**
   * PUT, not PATCH: each setting is one document whose fields constrain each
   * other and are validated together, so a partial write has no meaning.
   *
   * `description` is forwarded when given -- the API accepts it and it is the
   * only way an operator can leave a note on why a value was changed.
   */
  update: async (
    key: string,
    value: unknown,
    description?: string,
  ): Promise<SettingView> => {
    const { data } = await apiClient.put<SettingView>(
      `/settings/${encodeURIComponent(key)}`,
      { value, description },
    );
    return data;
  },
};
