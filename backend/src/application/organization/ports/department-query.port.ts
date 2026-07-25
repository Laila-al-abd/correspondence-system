/**
 * Read-side port for the organization context. The write model (the Department
 * aggregate) stays thin and id-based; this query port returns flat,
 * presentation-ready views that already carry the resolved org-unit type, so
 * the API can list, search, and render the department hierarchy without loading
 * aggregates. Soft-deleted rows are always excluded.
 */

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
}

export interface DepartmentQueryPort {
  list(filter: ListDepartmentsFilter): Promise<DepartmentView[]>
  getById(id: string): Promise<DepartmentView | null>
  tree(activeOnly: boolean): Promise<DepartmentTreeNode[]>
}
