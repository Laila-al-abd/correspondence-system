import apiClient from './axios-client';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  UpsertTemplateFieldDto,
  ReorderTemplateFieldsDto,
  TemplateCatalogView,
  TemplateFieldCatalogView,
  CreateTemplateResponse,
  UpdateTemplateResponse,
  RemoveTemplateFieldResponse,
  ReorderTemplateFieldsResponse,
  UpsertTemplateFieldResponse,
} from '@/types/catalog';


/**
 * All methods here reject with `ApiError` (src/types/shared.ts) on failure —
 * axios-client's response interceptor normalizes it before it gets here.
 * Callers should catch ApiError and branch on `.code`, not `.message`.
 */
export const templateApi = {
  /**
   * List templates (active by default).
   * GET /templates
   */
  getAll: async (includeInactive?: boolean): Promise<TemplateCatalogView[]> => {
    const { data } = await apiClient.get<TemplateCatalogView[]>('/templates', {
      params: {
        includeInactive: includeInactive ?? undefined,
      },
    });
    return data;
  },

  /**
   * Get a single template by UUID or code.
   * GET /templates/:idOrCode
   */
  getByIdOrCode: async (idOrCode: string): Promise<TemplateCatalogView> => {
    const { data } = await apiClient.get<TemplateCatalogView>(
      `/templates/${idOrCode}`
    );
    return data;
  },

  /**
   * Create a new template.
   * POST /templates
   */
  create: async (request: CreateTemplateDto): Promise<CreateTemplateResponse> => {
    const { data } = await apiClient.post<CreateTemplateResponse>(
      '/templates',
      request
    );
    return data;
  },

  /**
   * Update a template.
   * PATCH /templates/:id
   */
  update: async (
    id: string,
    request: UpdateTemplateDto
  ): Promise<UpdateTemplateResponse> => {
    const { data } = await apiClient.patch<UpdateTemplateResponse>(
      `/templates/${id}`,
      request
    );
    return data;
  },

  /**
   * Retire (deactivate) a template.
   * DELETE /templates/:id
   */
  retire: async (id: string): Promise<UpdateTemplateResponse> => {
    const { data } = await apiClient.delete<UpdateTemplateResponse>(
      `/templates/${id}`
    );
    return data;
  },

  /**
   * Upsert (add or update) a template field.
   * PUT /templates/:id/fields
   */
  upsertField: async (
    id: string,
    request: UpsertTemplateFieldDto
  ): Promise<UpsertTemplateFieldResponse> => {
    const { data } = await apiClient.put<UpsertTemplateFieldResponse>(
      `/templates/${id}/fields`,
      request
    );
    return data;
  },

  /**
   * Reorder template fields.
   * POST /templates/:id/fields/reorder
   */
  reorderFields: async (
    id: string,
    request: ReorderTemplateFieldsDto
  ): Promise<ReorderTemplateFieldsResponse> => {
    const { data } = await apiClient.post<ReorderTemplateFieldsResponse>(
      `/templates/${id}/fields/reorder`,
      request
    );
    return data;
  },

  /**
   * Remove a template field.
   * DELETE /templates/:id/fields/:fieldKey
   */
  removeField: async (
    id: string,
    fieldKey: string
  ): Promise<RemoveTemplateFieldResponse> => {
    const { data } = await apiClient.delete<RemoveTemplateFieldResponse>(
      `/templates/${id}/fields/${fieldKey}`
    );
    return data;
  },
};