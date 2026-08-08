// src/lib/hooks/use-access.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accessApi } from '@/lib/api/access';
import {
  AttributeDefinitionView,
  EligibleTemplateView,
  EligibilityRuleView,
  AddEligibilityRuleDto,
  TemplateEligibilityView,
} from '@/types/access';

export const accessKeys = {
  all: ['access'] as const,

  /** All attribute definitions for ABAC rules (no parameters). */
  attributes: () => ['access', 'attributes'] as const,

  /** Eligible templates for a specific user. Keys by userId. */
  eligibleTemplates: (userId: string) =>
    ['access', 'eligible-templates', userId] as const,

  /** Eligibility check for a specific user + template. Keys by both identifiers. */
  eligibility: (userId: string, templateId: string) =>
    ['access', 'eligibility', userId, templateId] as const,

  /** All eligibility rules for a specific template. Keys by templateId. */
  eligibilityRules: (templateId: string) =>
    ['access', 'eligibility-rules', templateId] as const,
};

/**
 * All attribute definitions (flat list, no pagination).
 * GET /access/attributes
 */
export function useAccessAttributes() {
  return useQuery({
    queryKey: accessKeys.attributes(),
    queryFn: () => accessApi.getAttributes(),
  });
}

/**
 * Templates a specific user is eligible to submit.
 * GET /access/users/:userId/eligible-templates
 */
export function useEligibleTemplates(userId: string) {
  return useQuery({
    queryKey: accessKeys.eligibleTemplates(userId),
    queryFn: () => accessApi.getEligibleTemplates(userId),
    enabled: !!userId,
  });
}

/**
 * Eligibility evaluation for one user against one template.
 * GET /access/users/:userId/templates/:templateId/eligibility
 */
export function useTemplateEligibility(userId: string, templateId: string) {
  return useQuery({
    queryKey: accessKeys.eligibility(userId, templateId),
    queryFn: () => accessApi.checkEligibility(userId, templateId),
    enabled: !!userId && !!templateId,
  });
}

/**
 * All eligibility rules attached to a template.
 * GET /access/templates/:templateId/eligibility-rules
 */
export function useEligibilityRules(templateId: string) {
  return useQuery({
    queryKey: accessKeys.eligibilityRules(templateId),
    queryFn: () => accessApi.getEligibilityRules(templateId),
    enabled: !!templateId,
  });
}

/**
 * Add an eligibility rule to a template.
 * POST /access/templates/:templateId/eligibility-rules
 *
 * Invalidates:
 * - eligibilityRules(templateId) — the rules list for this template changed directly.
 * We do NOT invalidate eligibleTemplates(userId) or eligibility(userId, templateId)
 * because those are keyed by userId (which we don't have here) and changing rules
 * could affect many users' eligibility. Consumers that need fresh eligibility
 * should refetch those queries explicitly, or the next navigation will pick up
 * the change naturally.
 */
export function useAddEligibilityRule(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AddEligibilityRuleDto) =>
      accessApi.addEligibilityRule(templateId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: accessKeys.eligibilityRules(templateId),
      });
    },
  });
}

/**
 * Remove an eligibility rule from a template.
 * DELETE /access/templates/:templateId/eligibility-rules/:ruleId
 *
 * Invalidates:
 * - eligibilityRules(templateId) — the rules list for this template changed directly.
 * Same scope rationale as useAddEligibilityRule.
 */
export function useRemoveEligibilityRule(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) =>
      accessApi.removeEligibilityRule(templateId, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: accessKeys.eligibilityRules(templateId),
      });
    },
  });
}