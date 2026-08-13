import { Inject, Injectable } from '@nestjs/common'
import type { WorkflowPath } from '../../../domain/workflow/workflow-path'
import type { WorkflowStep } from '../../../domain/workflow/workflow-step'
import { AssigneeType } from '../../../domain/workflow/enums'
import { Identifier } from '../../../domain/shared/identifier'
import type {
  AssigneeCandidate,
  AssigneeDirectoryPort,
} from '../ports/assignee-directory.port'
import { ASSIGNEE_DIRECTORY } from '../../tokens'

// Delegation can chain (A delegates to B while B delegates to C). Follow it,
// but never indefinitely -- bad data must not turn routing into a hang.
const MAX_DELEGATION_HOPS = 5

/**
 * The automatic step-routing engine. For each step in a workflow path it picks
 * exactly one owner (Option A) based on the step's assignee strategy:
 *
 *   SPECIFIC_ROLE            -> a holder of the step's role (scoped to the step's
 *                              department when given, otherwise held anywhere).
 *   SPECIFIC_UNIT            -> a holder of any role scoped to the step's unit.
 *   REQUESTER_DEPARTMENT_HEAD-> a holder of the step's role scoped to the
 *                              requester's own department (the "head" is modeled
 *                              as that scoped role -- no schema change).
 *   REQUESTER_FACULTY_DEAN   -> the same, scoped to the faculty that owns the
 *                              requester's department.
 *
 * Among eligible people it chooses the least busy (fewest open steps), balancing
 * load within this one request so several steps do not all land on one person.
 * The requester is never chosen (no self-approval); for head/dean steps where
 * the requester would be the only match, approval escalates up the org tree to
 * the parent unit until someone else qualifies. Steps with no resolvable
 * owner are simply left out of the result and stay unassigned for an admin to
 * handle manually -- starting a request never fails just because a downstream
 * step cannot be filled yet.
 */
@Injectable()
export class AssigneeResolver {
  constructor(
    @Inject(ASSIGNEE_DIRECTORY)
    private readonly directory: AssigneeDirectoryPort,
  ) {}

  /**
   * Returns a map of workflow-step id -> chosen owner id.
   *
   * `onlyStepIds` restricts routing to a subset of the path. Callers use it to
   * route just the steps that can be worked now, leaving the rest to be routed
   * when they actually open -- see StartRequestWorkflowHandler. Limiting the
   * pass also keeps the load-spreading honest: charging a candidate for a step
   * nobody can start yet would push the next real step onto someone else.
   */
  async resolveForPath(
    path: WorkflowPath,
    requesterId: Identifier,
    onlyStepIds?: ReadonlySet<string>,
  ): Promise<Map<string, Identifier>> {
    const result = new Map<string, Identifier>()
    // Extra load we have handed out during THIS run, so back-to-back steps that
    // share a candidate pool spread out instead of stacking on one person.
    const localLoad = new Map<string, number>()

    // Resolve the requester's department at most once.
    let cachedDeptId: string | null | undefined
    const requesterDepartmentId = async (): Promise<string | null> => {
      if (cachedDeptId === undefined)
        cachedDeptId = await this.directory.getUserDepartmentId(
          requesterId.toString(),
        )
      return cachedDeptId
    }

    // One read for the whole path. Delegation is applied AFTER the least-busy
    // choice rather than by folding delegates into the candidate pool: the
    // workload that decides the routing is the delegator's, and a stand-in who
    // covers three people should not be compared against them three times.
    const delegations = await this.directory.findActiveDelegations(new Date())
    const requesterKey = requesterId.toString()

    for (const step of path.steps) {
      if (onlyStepIds && !onlyStepIds.has(step.id.toString())) continue
      const candidates = await this.resolveCandidates(
        step,
        requesterId,
        requesterDepartmentId,
      )
      if (candidates.length === 0) continue

      let chosen: string | undefined
      let bestLoad = Number.POSITIVE_INFINITY
      for (const candidate of candidates) {
        const load =
          candidate.openStepCount + (localLoad.get(candidate.userId) ?? 0)
        if (load < bestLoad) {
          bestLoad = load
          chosen = candidate.userId
        }
      }
      if (chosen === undefined) continue

      const owner = this.applyDelegation(chosen, delegations, requesterKey)
      result.set(step.id.toString(), Identifier.of(owner))
      // Charge the load to whoever actually receives the step.
      localLoad.set(owner, (localLoad.get(owner) ?? 0) + 1)
    }
    return result
  }

  private async resolveCandidates(
    step: WorkflowStep,
    requesterId: Identifier,
    requesterDepartmentId: () => Promise<string | null>,
  ): Promise<AssigneeCandidate[]> {
    const snap = step.snapshot()
    const excludeUserId = requesterId.toString()

    switch (snap.assigneeType) {
      case AssigneeType.SPECIFIC_ROLE:
        // WorkflowStep.create enforces this, but rehydrate() does not, so a row
        // authored before that invariant existed still reaches here. Without
        // the guard the query below carries neither role nor department and
        // matches every active user in the university: the step would be handed
        // to whichever stranger happened to be least busy, silently and
        // plausibly.
        if (!snap.assigneeRoleId) return []
        // A step that names a department is scoped by it. A step that names
        // only a role is not narrowed -- but the requester's own unit is still
        // the right place to look first, so it is passed as a preference. Every
        // holder of the role remains eligible; the local one simply wins.
        return this.directory.findCandidates({
          roleId: snap.assigneeRoleId,
          departmentId: snap.assigneeDepartmentId,
          preferDepartmentId: snap.assigneeDepartmentId
            ? undefined
            : ((await requesterDepartmentId()) ?? undefined),
          requireScoped: false,
          excludeUserId,
        })

      case AssigneeType.SPECIFIC_UNIT:
        if (!snap.assigneeDepartmentId) return []
        return this.directory.findCandidates({
          departmentId: snap.assigneeDepartmentId,
          requireScoped: true,
          excludeUserId,
        })

      case AssigneeType.REQUESTER_DEPARTMENT_HEAD: {
        const departmentId = await requesterDepartmentId()
        if (!departmentId) return []
        return this.resolveUpwards(
          snap.assigneeRoleId,
          departmentId,
          excludeUserId,
        )
      }

      case AssigneeType.REQUESTER_FACULTY_DEAN: {
        const departmentId = await requesterDepartmentId()
        if (!departmentId) return []
        const facultyId = await this.directory.findFacultyId(departmentId)
        if (!facultyId) return []
        return this.resolveUpwards(snap.assigneeRoleId, facultyId, excludeUserId)
      }

      default:
        return []
    }
  }

  /**
   * Resolves a "head"/"dean" step by looking for the role scoped to the given
   * unit and, when nobody there qualifies (for example the only holder is the
   * requester), escalating up the org tree one level at a time until someone
   * else qualifies. This way a department head's own request is approved by
   * their supervisor instead of stalling or being self-approved.
   */
  private async resolveUpwards(
    roleId: string | undefined,
    startDepartmentId: string,
    excludeUserId: string,
  ): Promise<AssigneeCandidate[]> {
    // Same reasoning as SPECIFIC_ROLE. With no role id, requireScoped only
    // narrows to "anyone attached to this unit", so the requester's colleague
    // would be treated as their department head.
    if (!roleId) return []

    let currentId: string | null = startDepartmentId
    const visited = new Set<string>()
    while (currentId !== null) {
      if (visited.has(currentId)) break
      visited.add(currentId)

      const candidates = await this.directory.findCandidates({
        roleId,
        departmentId: currentId,
        requireScoped: true,
        excludeUserId,
      })
      if (candidates.length > 0) return candidates

      currentId = await this.directory.getParentDepartmentId(currentId)
    }
    return []
  }

  /**
   * Redirects a chosen owner to their delegate, if their authority is currently
   * delegated. Stops on a cycle, caps the chain, and refuses to land on the
   * requester -- a delegation must not become a back door to self-approval.
   */
  private applyDelegation(
    userId: string,
    delegations: Map<string, string>,
    requesterId: string,
  ): string {
    let current = userId
    const visited = new Set<string>([current])

    for (let hop = 0; hop < MAX_DELEGATION_HOPS; hop++) {
      const next = delegations.get(current)
      if (next === undefined || visited.has(next)) break
      if (next === requesterId) break
      visited.add(next)
      current = next
    }
    return current
  }

  /**
   * The people one step may legitimately be given to, for manual assignment.
   * Deliberately the same rules the router uses, so an admin cannot hand a step
   * to somebody automatic routing would never have picked -- including the
   * requester themselves.
   *
   * Current delegates are added to the pool rather than replacing their
   * delegator: manual assignment is a human decision, and both are defensible
   * targets while a delegation is open.
   */
  async candidatesForStep(
    step: WorkflowStep,
    requesterId: Identifier,
  ): Promise<AssigneeCandidate[]> {
    let cachedDeptId: string | null | undefined
    const requesterDepartmentId = async (): Promise<string | null> => {
      if (cachedDeptId === undefined)
        cachedDeptId = await this.directory.getUserDepartmentId(
          requesterId.toString(),
        )
      return cachedDeptId
    }

    const candidates = await this.resolveCandidates(
      step,
      requesterId,
      requesterDepartmentId,
    )
    if (candidates.length === 0) return []

    const delegations = await this.directory.findActiveDelegations(new Date())
    const requesterKey = requesterId.toString()
    const byUser = new Map<string, AssigneeCandidate>(
      candidates.map((candidate) => [candidate.userId, candidate]),
    )

    for (const candidate of candidates) {
      const delegate = this.applyDelegation(
        candidate.userId,
        delegations,
        requesterKey,
      )
      if (delegate !== candidate.userId && !byUser.has(delegate))
        byUser.set(delegate, {
          userId: delegate,
          openStepCount: candidate.openStepCount,
        })
    }
    return [...byUser.values()]
  }

  /**
   * The people an admin may hand this step to, in two tiers.
   *
   *   recommended -- exactly who automatic routing would have considered.
   *   wider       -- everyone else holding the step's role, any department.
   *
   * Both tiers are assignable. The split exists so the UI can lead with the
   * people the workflow was designed around while still letting an admin reach
   * past a vacant or overloaded local pool, which is the whole reason manual
   * assignment exists. Steps with no role requirement have no wider tier: there
   * is no permission to widen to, and returning every active user in the
   * university as a "candidate" would be a list, not an answer.
   */
  async assignableUsersForStep(
    step: WorkflowStep,
    requesterId: Identifier,
  ): Promise<{ recommended: AssigneeCandidate[]; wider: AssigneeCandidate[] }> {
    const recommended = await this.candidatesForStep(step, requesterId)

    const roleId = step.snapshot().assigneeRoleId
    if (!roleId) return { recommended, wider: [] }

    const holders = await this.directory.findRoleHolders({
      roleId,
      // The no-self-approval rule is not negotiable by an admin either.
      excludeUserId: requesterId.toString(),
    })
    const alreadyListed = new Set(recommended.map((c) => c.userId))
    return {
      recommended,
      wider: holders.filter((h) => !alreadyListed.has(h.userId)),
    }
  }

  /**
   * Routes a single step, now, using today's directory rather than the state of
   * the world when the request was first routed.
   *
   * resolveForPath answers for a whole path in one pass and spreads load across
   * it. That is the right shape at start time and the wrong shape at release
   * time, where exactly one step has come due and the other steps' owners are
   * already settled facts that must not be reshuffled.
   *
   * Returns undefined when nobody qualifies. That is a real answer, not a
   * failure: the caller leaves the existing ownership alone and alerts an admin.
   */
  async resolveOwnerForStep(
    step: WorkflowStep,
    requesterId: Identifier,
  ): Promise<Identifier | undefined> {
    let cachedDeptId: string | null | undefined
    const requesterDepartmentId = async (): Promise<string | null> => {
      if (cachedDeptId === undefined)
        cachedDeptId = await this.directory.getUserDepartmentId(
          requesterId.toString(),
        )
      return cachedDeptId
    }

    const candidates = await this.resolveCandidates(
      step,
      requesterId,
      requesterDepartmentId,
    )
    if (candidates.length === 0) return undefined

    let chosen: string | undefined
    let bestLoad = Number.POSITIVE_INFINITY
    for (const candidate of candidates) {
      if (candidate.openStepCount < bestLoad) {
        bestLoad = candidate.openStepCount
        chosen = candidate.userId
      }
    }
    if (chosen === undefined) return undefined

    const delegations = await this.directory.findActiveDelegations(new Date())
    return Identifier.of(
      this.applyDelegation(chosen, delegations, requesterId.toString()),
    )
  }

  /**
   * Where this person's authority currently sits. Returns the same id when no
   * delegation is open, so the caller can compare and do nothing.
   *
   * Used to honour a delegation that was granted *after* the step was routed:
   * the original owner is still a perfectly valid employee, so no re-resolution
   * is warranted, but the file should land on their stand-in.
   */
  async currentDelegateFor(
    userId: string,
    requesterId: Identifier,
  ): Promise<string> {
    const delegations = await this.directory.findActiveDelegations(new Date())
    return this.applyDelegation(userId, delegations, requesterId.toString())
  }
}
