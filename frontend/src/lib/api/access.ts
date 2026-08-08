import apiClient from './axios-client';
import {
  AttributeDefinitionView,
  EligibleTemplateView,
  EligibilityRuleView,
  AddEligibilityRuleDto,
  TemplateEligibilityView,
} from '@/types/access';

/**
 * All methods here reject with `ApiError` (src/types/shared.ts) on failure —
 * axios-client's response interceptor normalizes it before it gets here.
 * Callers should catch ApiError and branch on `.code`, not `.message`.
 */
export const accessApi = {
  /**
   * Get all attribute definitions for ABAC rules.
   * GET /access/attributes
   */
  getAttributes: async (): Promise<AttributeDefinitionView[]> => {
    const { data } = await apiClient.get<AttributeDefinitionView[]>('/access/attributes');
    return data;
  },

  /**
   * Get eligible templates for a specific user.
   * GET /access/users/:userId/eligible-templates
   */
  getEligibleTemplates: async (userId: string): Promise<EligibleTemplateView[]> => {
    const { data } = await apiClient.get<EligibleTemplateView[]>(
      `/access/users/${userId}/eligible-templates`
    );
    return data;
  },

  /**
   * Check if a user is eligible for a specific template.
   * GET /access/users/:userId/templates/:templateId/eligibility
   */
  checkEligibility: async (
    userId: string,
    templateId: string
  ): Promise<TemplateEligibilityView> => {
    const { data } = await apiClient.get<TemplateEligibilityView>(
      `/access/users/${userId}/templates/${templateId}/eligibility`
    );
    return data;
  },

  /**
   * List all eligibility rules for a template.
   * GET /access/templates/:templateId/eligibility-rules
   */
  getEligibilityRules: async (templateId: string): Promise<EligibilityRuleView[]> => {
    const { data } = await apiClient.get<EligibilityRuleView[]>(
      `/access/templates/${templateId}/eligibility-rules`
    );
    return data;
  },

  /**
   * Add an eligibility rule to a template.
   * POST /access/templates/:templateId/eligibility-rules
   */
  addEligibilityRule: async (
    templateId: string,
    request: AddEligibilityRuleDto
  ): Promise<EligibilityRuleView> => {
    const { data } = await apiClient.post<EligibilityRuleView>(
      `/access/templates/${templateId}/eligibility-rules`,
      request
    );
    return data;
  },

  /**
   * Remove an eligibility rule from a template.
   * DELETE /access/templates/:templateId/eligibility-rules/:ruleId
   */
  removeEligibilityRule: async (
    templateId: string,
    ruleId: string
  ): Promise<void> => {
    await apiClient.delete(`/access/templates/${templateId}/eligibility-rules/${ruleId}`);
  },
};