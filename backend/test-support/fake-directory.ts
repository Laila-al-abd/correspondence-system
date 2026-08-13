/**
 * An in-memory AssigneeDirectoryPort for unit tests.
 *
 * Routing is the part of this system that is hardest to test by hand: proving
 * that a step went to the right desk through the UI costs a seeded database, a
 * login, a submission and a classification, and it proves it for exactly one
 * arrangement of people. The rules themselves live in AssigneeResolver, which
 * touches the world only through this port -- so replacing the port with a
 * fake directory turns "who gets this step" into an ordinary function of data,
 * and thirty arrangements of people become thirty assertions that run in
 * milliseconds with no database at all.
 *
 * The fake is deliberately not a stub that returns canned arrays. It reproduces
 * the *semantics* of PrismaAssigneeDirectory -- role scoping, the
 * scoped-beats-global tier, ordering by workload then id, exclusion of the
 * requester and of inactive users. A stub would let the resolver pass tests
 * while the real query disagreed with it, which is precisely the class of bug
 * this file exists to catch.
 */
import type {
  AssigneeCandidate,
  AssigneeDirectoryPort,
  FindCandidatesQuery,
} from '../src/application/request/ports/assignee-directory.port'

export type UnitKind =
  | 'UNIVERSITY'
  | 'FACULTY'
  | 'DEPARTMENT'
  | 'UNIT'
  | 'OFFICE'

/** One row of user_roles: the role, and the unit it is scoped to (if any). */
export interface FakeRoleAssignment {
  roleId: string
  /** Undefined means the role is held globally, i.e. departmentId IS NULL. */
  departmentId?: string
}

export interface FakeUser {
  id: string
  /** The user's home unit, as returned by getUserDepartmentId. */
  departmentId?: string
  roles?: FakeRoleAssignment[]
  /** Open (non-terminal) step instances already on this person's desk. */
  openStepCount?: number
  /** Defaults to true. False models a deactivated or soft-deleted account. */
  active?: boolean
}

export interface FakeUnit {
  id: string
  parentId?: string
  kind?: UnitKind
}

export interface FakeDirectoryData {
  users?: FakeUser[]
  units?: FakeUnit[]
  /** Delegator -> delegate, as findActiveDelegations would return them. */
  delegations?: Array<{ from: string; to: string }>
}

export class FakeAssigneeDirectory implements AssigneeDirectoryPort {
  /**
   * Every candidate query the resolver issued, in order. Tests assert on this
   * as well as on the answer: a step that names a department must *scope* the
   * query, and a step that names only a role must merely *prefer* the
   * requester's unit. Those two produce the same owner in a small fixture and
   * completely different behaviour in a real institute, so the shape of the
   * question is worth asserting on directly.
   */
  readonly calls: FindCandidatesQuery[] = []

  private readonly users: FakeUser[]
  private readonly units: FakeUnit[]
  private readonly delegations: Array<{ from: string; to: string }>

  constructor(data: FakeDirectoryData) {
    this.users = data.users ?? []
    this.units = data.units ?? []
    this.delegations = data.delegations ?? []
  }

  async findCandidates(
    query: FindCandidatesQuery,
  ): Promise<AssigneeCandidate[]> {
    this.calls.push(query)

    const wanted = query.departmentId ?? query.preferDepartmentId ?? null
    const matched: AssigneeCandidate[] = []

    for (const user of this.users) {
      if (user.active === false) continue
      if (query.excludeUserId && user.id === query.excludeUserId) continue

      const assignments = (user.roles ?? []).filter((assignment) => {
        if (query.roleId && assignment.roleId !== query.roleId) return false
        if (query.departmentId === undefined) return true
        return query.requireScoped
          ? assignment.departmentId === query.departmentId
          : assignment.departmentId === query.departmentId ||
              assignment.departmentId === undefined
      })
      if (assignments.length === 0) continue

      matched.push({
        userId: user.id,
        openStepCount: user.openStepCount ?? 0,
        scoped:
          wanted !== null &&
          assignments.some((assignment) => assignment.departmentId === wanted),
      })
    }

    // Locality is a filter, not a tie-break -- same as the Prisma adapter.
    const scoped = matched.filter((candidate) => candidate.scoped)
    return this.sorted(scoped.length > 0 ? scoped : matched)
  }

  async getUserDepartmentId(userId: string): Promise<string | null> {
    return this.user(userId)?.departmentId ?? null
  }

  async findFacultyId(departmentId: string): Promise<string | null> {
    let current: string | undefined = departmentId
    const visited = new Set<string>()
    while (current !== undefined && !visited.has(current)) {
      visited.add(current)
      const unit = this.units.find((candidate) => candidate.id === current)
      if (unit === undefined) return null
      if (unit.kind === 'FACULTY') return unit.id
      current = unit.parentId
    }
    return null
  }

  async getParentDepartmentId(departmentId: string): Promise<string | null> {
    return (
      this.units.find((unit) => unit.id === departmentId)?.parentId ?? null
    )
  }

  async findActiveDelegations(_on: Date): Promise<Map<string, string>> {
    return new Map(
      this.delegations.map((delegation) => [delegation.from, delegation.to]),
    )
  }

  async isAssignable(userId: string): Promise<boolean> {
    const user = this.user(userId)
    return user !== undefined && user.active !== false
  }

  async findRoleHolders(query: {
    roleId: string
    excludeUserId?: string
  }): Promise<AssigneeCandidate[]> {
    const holders: AssigneeCandidate[] = []
    for (const user of this.users) {
      if (user.active === false) continue
      if (query.excludeUserId && user.id === query.excludeUserId) continue
      if (!(user.roles ?? []).some((role) => role.roleId === query.roleId))
        continue
      holders.push({
        userId: user.id,
        openStepCount: user.openStepCount ?? 0,
      })
    }
    return this.sorted(holders)
  }

  private user(userId: string): FakeUser | undefined {
    return this.users.find((user) => user.id === userId)
  }

  /** Least busy first, ties broken by ascending id, exactly like the adapter. */
  private sorted(pool: AssigneeCandidate[]): AssigneeCandidate[] {
    return [...pool].sort((a, b) => {
      if (a.openStepCount !== b.openStepCount)
        return a.openStepCount - b.openStepCount
      return a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0
    })
  }
}

/** Convenience wrapper so a test reads as one expression. */
export function fakeDirectory(data: FakeDirectoryData): FakeAssigneeDirectory {
  return new FakeAssigneeDirectory(data)
}
