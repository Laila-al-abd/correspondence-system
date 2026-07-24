import type { Template } from '../../../../domain/catalog/template'

/** Summary of a template a user is eligible to submit. */
export interface EligibleTemplateView {
  id: string
  title: { ar: string; en?: string }
  categoryId: string
  sensitivityLevelId: string
}

export function toEligibleTemplateView(template: Template): EligibleTemplateView {
  const s = template.snapshot()
  return {
    id: template.id.toString(),
    title: s.title,
    categoryId: s.categoryId,
    sensitivityLevelId: s.sensitivityLevelId,
  }
}
