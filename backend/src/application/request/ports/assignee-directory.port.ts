/**
 * Read-side port used by the routing engine to turn a workflow step's assignee
 * strategy into a concrete owner. It answers three questions against the
 * directory: who could handle this step, what is the requester's home
 * department, and which faculty owns a given department. All lookups ignore
 * soft-deleted and non-active users.
 */

export interface FindCandidatesQuery {
  // When set, the user must hold this specific role.
  roleId?: string
  // When set, constrains the role's scope to this department.
  departmentId?: string
  // true  -> the role must be scoped exactly to departmentId (head/dean/unit).
  // false -> the role may be scoped to departmentId OR held globally (role).
  requireScoped?: boolean
  // Never propose this user (e.g. the requester, to avoid self-approval).
  excludeUserId?: string
}

export interface AssigneeCandidate {
  userId: string
  // Count of the user's currently open (non-terminal) step instances.
  openStepCount: number
}

export interface AssigneeDirectoryPort {
  /**
   * Active users matching the query, each with their current workload, sorted
   * least-busy first (ties broken by ascending user id for determinism).
   */
  findCandidates(query: FindCandidatesQuery): Promise<AssigneeCandidate[]>
  /** The requester's home department id, or null if they have none. */
  getUserDepartmentId(userId: string): Promise<string | null>
  /** Walks up the org tree to the owning FACULTY unit id, or null. */
  findFacultyId(departmentId: string): Promise<string | null>
  /** The immediate parent unit id of a department, or null at the top. */
  getParentDepartmentId(departmentId: string): Promise<string | null>
}
