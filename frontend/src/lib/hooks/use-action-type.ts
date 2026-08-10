// src/lib/hooks/use-action-type.ts
import { useQuery } from '@tanstack/react-query';
import { actionTypeApi } from '@/lib/api/action-type';

export const actionTypeKeys = {
  all: ['actionTypes'] as const,
  list: (onlyTerminal?: boolean) => ['actionTypes', 'list', onlyTerminal ?? null] as const,
};

/** All action types, optionally filtered to only terminal ones. No pagination — backend returns a flat list. */
export function useActionTypes(onlyTerminal?: boolean) {
  return useQuery({
    queryKey: actionTypeKeys.list(onlyTerminal),
    queryFn: () => actionTypeApi.getAll(onlyTerminal),
  });
}