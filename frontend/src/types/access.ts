/**
 * Frontend TypeScript types for the Access/Identity module.
 * Synchronized with backend DTOs, command interfaces, and query views.
 * Generated from:
 * - backend/src/interface/access/dto/*.dto.ts
 * - backend/src/application/access/commands/**.command.ts
 * - backend/src/application/access/queries/views/*.view.ts
 * - backend/src/domain/catalog/enums.ts
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Eligibility rule operators for attribute comparison.
 * Matches backend RuleOperator enum and @IsIn(['EQ', 'NEQ', 'IN', 'GTE', 'LTE']) validation.
 * Source: backend/src/domain/catalog/enums.ts
 */
export enum EligibilityOperator {
  EQ = 'EQ',
  NEQ = 'NEQ',
  IN = 'IN',
  GTE = 'GTE',
  LTE = 'LTE',
}

/**
 * Data types for attribute definitions and template fields.
 * Source: backend/src/domain/catalog/enums.ts
 */
export enum AttributeDataType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  ENUM = 'ENUM',
}

// ============================================================================
// DTO Types (matching backend DTOs)
// ============================================================================

/**
 * Request body for adding an eligibility rule to a template.
 * POST /access/templates/:templateId/eligibility-rules
 * Matches: backend/src/interface/access/dto/add-eligibility-rule.dto.ts
 */
export interface AddEligibilityRuleDto {
  /** The attribute code to evaluate (1-100 characters) */
  attributeCode: string;

  /** The comparison operator */
  operator: EligibilityOperator;

  /** The value to compare against (arbitrary JSON, validated per-operator in handler) */
  value: unknown;
}

// ============================================================================
// Query View Types (matching backend query views)
// ============================================================================

/**
 * Read model for an ABAC attribute definition in the vocabulary.
 * Source: backend/src/application/access/queries/views/attribute-definition.view.ts
 */
export interface AttributeDefinitionView {
  /** Unique identifier */
  id: string;

  /** Machine-readable attribute code */
  code: string;

  /** Human-readable label (Arabic required, English optional) */
  label: { ar: string; en?: string };

  /** Data type of the attribute */
  dataType: AttributeDataType;

  /** Optional description (Arabic required, English optional) */
  description?: { ar: string; en?: string };
}

/**
 * Summary of a template a user is eligible to submit.
 * Source: backend/src/application/access/queries/views/eligible-template.view.ts
 */
export interface EligibleTemplateView {
  /** Unique identifier */
  id: string;

  /** Template title (Arabic required, English optional) */
  title: { ar: string; en?: string };

  /** Category identifier */
  categoryId?: string;

  /** Sensitivity level identifier - optional */
  sensitivityLevelId?: string;
}

/**
 * A single ABAC eligibility rule attached to a template (read model).
 * Source: backend/src/application/access/queries/views/eligibility-rule.view.ts
 */
export interface EligibilityRuleView {
  /** Unique identifier for the rule */
  id: string;

  /** The template ID this rule belongs to */
  templateId: string;

  /** The attribute definition ID */
  attributeId: string;

  /** The human-readable attribute code (e.g. "user_type"); null if the
   * referenced attribute definition has since been removed. */
  attributeCode: string | null;

  /** The comparison operator */
  operator: string;

  /** The value to compare against (arbitrary JSON) */
  value: unknown;
}

/**
 * A single unmet eligibility rule from eligibility evaluation.
 * Source: backend/src/application/access/evaluate-eligibility.ts (UnmetRuleView)
 */
export interface UnmetRuleView {
  /** The attribute definition ID */
  attributeId: string;

  /** The human-readable attribute code (optional) */
  attributeCode?: string;

  /** The comparison operator */
  operator: string;

  /** The value to compare against */
  value: unknown;
}

/**
 * Result of evaluating a template's ABAC rules against a user.
 * Source: backend/src/application/access/evaluate-eligibility.ts (TemplateEligibilityView)
 */
export interface TemplateEligibilityView {
  /** The user ID that was evaluated */
  userId: string;

  /** The template ID that was evaluated */
  templateId: string;

  /** Whether the user is eligible for the template */
  eligible: boolean;

  /** List of rules that were not satisfied */
  unmetRules: UnmetRuleView[];
}