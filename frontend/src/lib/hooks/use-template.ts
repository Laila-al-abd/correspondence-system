// src/lib/hooks/use-template.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateApi } from '@/lib/api/template';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  UpsertTemplateFieldDto,
  ReorderTemplateFieldsDto,
} from '@/types/catalog';

export const templateKeys = {
  all: ['templates'] as const,
  list: (includeInactive?: boolean) => ['templates', 'list', includeInactive ?? null] as const,
  detail: (idOrCode: string) => ['templates', idOrCode] as const,
};

/** Active templates by default; pass true to also include retired ones. */
export function useTemplates(includeInactive?: boolean) {
  return useQuery({
    queryKey: templateKeys.list(includeInactive),
    queryFn: () => templateApi.getAll(includeInactive),
  });
}

/** One template, looked up by UUID or by its stable code. */
export function useTemplate(idOrCode: string) {
  return useQuery({
    queryKey: templateKeys.detail(idOrCode),
    queryFn: () => templateApi.getByIdOrCode(idOrCode),
    enabled: !!idOrCode,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateTemplateDto) => templateApi.create(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: templateKeys.all }),
  });
}

export function useUpdateTemplate(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateTemplateDto) => templateApi.update(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
    },
  });
}

/** Deactivates a template (not a delete — history and past requests stay intact). */
export function useRetireTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => templateApi.retire(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
    },
  });
}

/** Adds a field, or redefines it if the key already exists on the template. */
export function useUpsertTemplateField(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpsertTemplateFieldDto) =>
      templateApi.upsertField(templateId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
    },
  });
}

/** Sets field presentation order. Must name every declared field exactly once. */
export function useReorderTemplateFields(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ReorderTemplateFieldsDto) =>
      templateApi.reorderFields(templateId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
    },
  });
}

/** Removes a field definition. Answers already stored under the key are left alone. */
export function useRemoveTemplateField(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fieldKey: string) => templateApi.removeField(templateId, fieldKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
    },
  });
}