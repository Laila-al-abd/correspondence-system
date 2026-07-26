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

  /** Returns a map of workflow-step id -> chosen owner id. */
  async resolveForPath(
    path: WorkflowPath,
    requesterId: Identifier,
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

    for (const step of path.steps) {
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

      result.set(step.id.toString(), Identifier.of(chosen))
      localLoad.set(chosen, (localLoad.get(chosen) ?? 0) + 1)
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
        return this.directory.findCandidates({
          roleId: snap.assigneeRoleId,
          departmentId: snap.assigneeDepartmentId,
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
}
