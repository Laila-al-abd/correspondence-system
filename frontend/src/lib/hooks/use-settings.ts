// src/lib/hooks/use-settings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api/settings';

export const settingKeys = {
  all: ['settings'] as const,
  index: () => ['settings', 'index'] as const,
  one: (key: string) => ['settings', 'one', key] as const,
};

/** The keys an administrator may edit in this build. */
export function useSettingKeys() {
  return useQuery({
    queryKey: settingKeys.index(),
    queryFn: () => settingsApi.listKeys(),
  });
}

/**
 * One setting's effective value.
 *
 * staleTime 0: these are operational knobs read by a person who is about to
 * change them, so a cached value would invite writing over somebody else's
 * edit made a minute ago.
 */
export function useSetting(key: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: settingKeys.one(key),
    queryFn: () => settingsApi.getOne(key),
    enabled: options?.enabled ?? true,
    staleTime: 0,
  });
}

/**
 * Replaces a setting.
 *
 * The whole `settings` tree is invalidated rather than just the one key,
 * because saving working hours changes what every SLA date on screen means.
 *
 * Note the argument shape: `description` is part of it, so the parameter the
 * API function accepts cannot be silently dropped by the mutationFn -- the
 * mistake found in the turn-16 audit.
 */
export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { key: string; value: unknown; description?: string }) =>
      settingsApi.update(input.key, input.value, input.description),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: settingKeys.all }),
  });
}
