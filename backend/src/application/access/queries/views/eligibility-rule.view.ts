/** A single ABAC eligibility rule attached to a template. */
export interface EligibilityRuleView {
  id: string
  templateId: string
  attributeId: string
  // The human-readable attribute code (e.g. "user_type"); null if the
  // referenced attribute definition has since been removed.
  attributeCode: string | null
  operator: string
  value: unknown
}
