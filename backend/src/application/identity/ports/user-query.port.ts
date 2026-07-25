/**
 * Read-side port for the identity context. The write model (the User aggregate)
 * stays focused on invariants; this query port returns flat, presentation-ready
 * views for the admin user directory - a paginated list plus a single-user
 * detail that resolves the user's roles and ABAC attributes. Soft-deleted rows
 * are always excluded.
 */

export interface UserSummaryView {
  id: string
  userType: string
  fullNameAr: string
  fullNameEn: string | null
  email: string
  phone: string | null
  institutionalNumber: string | null
  departmentId: string | null
  status: string
  authProvider: string
  preferredLang: string
  createdAt: string
}

export interface UserRoleView {
  roleId: string
  roleName: { ar: string; en?: string }
  departmentId: string | null
  expiresAt: string | null
  assignedAt: string
}

export interface UserAttributeView {
  attributeId: string
  attributeCode: string
  value: unknown
}

export interface UserDetailView extends UserSummaryView {
  applicantPurpose: string | null
  roles: UserRoleView[]
  attributes: UserAttributeView[]
}

export interface ListUsersFilter {
  // Case-insensitive substring match on full name (ar/en), email, or
  // institutional number.
  search?: string
  userType?: string
  status?: string
  departmentId?: string
  // Page size (clamped 1..200; default 50) and zero-based offset.
  limit?: number
  offset?: number
}

export interface ListUsersResult {
  total: number
  limit: number
  offset: number
  items: UserSummaryView[]
}

export interface UserQueryPort {
  list(filter: ListUsersFilter): Promise<ListUsersResult>
  getDetail(id: string): Promise<UserDetailView | null>
}
