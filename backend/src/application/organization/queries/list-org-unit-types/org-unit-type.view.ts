/** Read model returned to callers of the list-org-unit-types query. */
export interface OrgUnitTypeView {
  id: string
  code: string
  name: { ar: string; en?: string }
}