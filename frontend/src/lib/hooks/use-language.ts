// src/lib/hooks/use-language.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { languageApi } from '@/lib/api/language';
import { CreateLanguageDto } from '@/types/catalog';

export const languageKeys = {
  all: ['languages'] as const,
  list: (onlyEnabled?: boolean) => ['languages', 'list', onlyEnabled ?? null] as const,
};

/** All languages, optionally filtered to only enabled ones. No pagination — backend returns a flat list. */
export function useLanguages(onlyEnabled?: boolean) {
  return useQuery({
    queryKey: languageKeys.list(onlyEnabled),
    queryFn: () => languageApi.getAll(onlyEnabled),
  });
}

export function useCreateLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateLanguageDto) => languageApi.create(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: languageKeys.all }),
  });
}