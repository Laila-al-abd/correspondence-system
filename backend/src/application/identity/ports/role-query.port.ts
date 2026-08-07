/**
 * Read-side port for role administration.
 *
 * The Role aggregate exists to protect invariants and carries permission
 * *codes*; an administration screen needs something else -- localized names, the
 * permission vocabulary grouped into the folders `permission_groups` exists for,
 * and the counts that decide whether a role can be retired. Building that from
 * the write model would mean loading every aggregate to count join rows.
 *
 * Soft-deleted roles are never returned.
 */

export interface LocalizedTextView {
  ar: string
  en?: string
}

export interface PermissionView {
  id: string
  code: string
  name: LocalizedTextView
  description: LocalizedTextView | null
}

export interface PermissionGroupView {
  id: string
  name: LocalizedTextView
  description: LocalizedTextView | null
  permissions: PermissionView[]
}

export interface RoleSummaryView {
  id: string
  name: LocalizedTextView
  description: LocalizedTextView | null
  // Built-in roles are seed-owned and refuse edits; the screen should say so
  // rather than offer buttons that return 400.
  isSystem: boolean
  permissionCount: number
  // Assignments pointing at this role, expired ones included -- what decides
  // whether the role can be retired yet.
  assignmentCount: number
  createdAt: string
}

export interface RoleDetailView extends RoleSummaryView {
  permissions: PermissionView[]
}

export interface RoleQueryPort {
  listRoles(): Promise<RoleSummaryView[]>
  getRole(id: string): Promise<RoleDetailView | null>
  // The whole permission vocabulary, grouped for the assignment screen.
  listPermissionGroups(): Promise<PermissionGroupView[]>
}
