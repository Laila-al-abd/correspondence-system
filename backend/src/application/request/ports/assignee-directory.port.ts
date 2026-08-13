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
  /**
   * A department to prefer without requiring. Unlike departmentId this does not
   * narrow the query at all -- every holder still matches -- it only decides
   * which of them count as local, so the caller's locality tier is applied to a
   * pool it did not shrink.
   *
   * This exists for the step that names a role and no department, which means
   * "any holder of this role". Ignoring locality there sent the work to whoever
   * was least busy anywhere in the institute; requiring locality instead would
   * leave the step unassigned whenever the requester's own unit had nobody.
   * Preferring it gets the local desk when there is one and keeps the rest of
   * the institute as the fallback.
   */
  preferDepartmentId?: string
  // Never propose this user (e.g. the requester, to avoid self-approval).
  excludeUserId?: string
}

export interface AssigneeCandidate {
  userId: string
  // Count of the user's currently open (non-terminal) step instances.
  openStepCount: number
  /**
   * True when this holder matched because their role is scoped to the
   * department the query asked for, rather than because they hold it globally.
   * Only meaningful when the query carried a departmentId.
   */
  scoped?: boolean
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

  /**
   * Delegations in force on `on`, as delegator id -> delegate id.
   *
   * Routing has to know about these. A delegation says "while I am away, my
   * authority is X's"; without this lookup the router keeps handing steps to
   * someone who is on leave, and the delegation feature only ever affects who
   * may act on work that has already landed in the wrong inbox.
   *
   * Revoked, soft-deleted and out-of-window delegations are excluded, as are
   * delegations to a delegate who is no longer an active user.
   */
  findActiveDelegations(on: Date): Promise<Map<string, string>>

  /**
   * Whether this user can be given work at all: they exist, are ACTIVE and are
   * not soft-deleted. Used to vet manual assignment, which does not go through
   * the candidate query.
   */
  isAssignable(userId: string): Promise<boolean>

  /**
   * Every active holder of `roleId`, anywhere in the institute, ignoring the
   * department scoping that automatic routing applies.
   *
   * Routing is deliberately narrow: it picks one owner and it should pick a
   * local one. Manual assignment is the escape hatch for when that narrowness
   * has produced nobody, or the wrong somebody, and the admin can see context
   * the router cannot. Restricting the manual list to the same department would
   * make the escape hatch useless in exactly the case it exists for.
   */
  findRoleHolders(query: {
    roleId: string
    excludeUserId?: string
  }): Promise<AssigneeCandidate[]>
}
