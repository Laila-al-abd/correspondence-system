/**
 * Read-side port for the organization context. The write model (the Department
 * aggregate) stays thin and id-based; this query port returns flat,
 * presentation-ready views that already carry the resolved org-unit type, so
 * the API can list, search, and render the department hierarchy without loading
 * aggregates. Soft-deleted rows are always excluded.
 */
import { OffsetPage } from '../../shared/pagination'

export interface DepartmentUnitTypeView {
  id: string
  code: string
  name: { ar: string; en?: string }
}

export interface DepartmentView {
  id: string
  parentId: string | null
  unitType: DepartmentUnitTypeView
  name: { ar: string; en?: string }
  description: { ar: string; en?: string } | null
  isActive: boolean
  sourceSystem: string
  externalId: string | null
  lastSyncedAt: string | null
}

export interface DepartmentTreeNode extends DepartmentView {
  children: DepartmentTreeNode[]
}

export interface ListDepartmentsFilter {
  // Case-sensitive substring match against the Arabic or English name.
  search?: string
  // Restrict the result to the direct children of this department id.
  parentId?: string
  // When true, only active units are returned.
  activeOnly?: boolean
  // Page size (clamped 1..200; default 50) and zero-based offset.
  limit?: number
  offset?: number
}

export interface DepartmentQueryPort {
  /**
   * A page of the flat department list, browsed by page number. Offset paging
   * suits this list: an org chart changes a few times a year, so the rows are
   * effectively stable while an administrator reads them, and being able to
   * jump to a page is worth more here than insert-safety.
   *
   * `tree` is deliberately not paged -- half a hierarchy is not a smaller
   * hierarchy, it is a broken one, with children whose parents are missing.
   */
  list(filter: ListDepartmentsFilter): Promise<OffsetPage<DepartmentView>>
  getById(id: string): Promise<DepartmentView | null>
  tree(activeOnly: boolean): Promise<DepartmentTreeNode[]>
}
