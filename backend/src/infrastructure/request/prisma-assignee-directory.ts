import { Injectable } from '@nestjs/common'
import { Prisma } from '../../../generated/prisma/client'
import type {
  AssigneeCandidate,
  AssigneeDirectoryPort,
  FindCandidatesQuery,
} from '../../application/request/ports/assignee-directory.port'
import { PrismaService } from '../persistence/prisma.service'
import { activeRoleAssignment } from '../identity/role-access.where'

// A step is "open" (counts as workload) until it reaches a terminal state.
const OPEN_STATUSES = ['PENDING', 'IN_PROGRESS', 'WAITING']
const FACULTY_KIND = 'FACULTY'

/**
 * Prisma-backed directory for the routing engine. Finds eligible role holders
 * and measures their live workload so the engine can pick the least-busy owner.
 */
@Injectable()
export class PrismaAssigneeDirectory implements AssigneeDirectoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findCandidates(
    query: FindCandidatesQuery,
  ): Promise<AssigneeCandidate[]> {
    const now = new Date()
    const conditions: Prisma.UserRoleWhereInput[] = [activeRoleAssignment(now)]
    if (query.roleId) conditions.push({ roleId: query.roleId })
    if (query.departmentId) {
      const dept = query.departmentId
      conditions.push(
        query.requireScoped
          ? { departmentId: dept }
          : { OR: [{ departmentId: dept }, { departmentId: null }] },
      )
    }

    // A closed unit must stop receiving work.
    //
    // A scoped role assignment carries a department id, and that department may
    // since have been deactivated -- by hand on the departments screen, or by a
    // directory sync that no longer sees the unit in the feed. Nothing here
    // looked at that flag, so a closed department kept collecting requests
    // through the desks scoped to it: the deactivation was visible in the tree
    // and invisible to the router.
    //
    // Global holders are deliberately untouched. Their assignment carries no
    // department id, so no unit's status can disqualify them -- and because the
    // scoped tier is now empty for a closed unit, the fallback that already
    // exists for "this department has nobody eligible" is exactly the behaviour
    // a closed department wants.
    conditions.push({
      OR: [
        { departmentId: null },
        { department: { isActive: true, deletedAt: null } },
      ],
    })

    const userWhere: Prisma.UserWhereInput = {
      status: 'ACTIVE',
      deletedAt: null,
    }
    if (query.excludeUserId)
      userWhere.id = { not: query.excludeUserId }

    // departmentId is selected alongside userId because, when requireScoped is
    // false, a holder can match this query in either of two ways: their role is
    // scoped to the department we asked about, or they hold it globally. Those
    // are not the same answer, so the rows must not be collapsed with
    // `distinct` before we have looked at how each one matched.
    const holders = await this.prisma.userRole.findMany({
      where: { AND: conditions, user: userWhere },
      select: { userId: true, departmentId: true },
    })
    if (holders.length === 0) return []

    // Which department makes a holder "local". preferDepartmentId is consulted
    // only when the caller did not constrain the query, because a step that
    // names its own department has already said where the work belongs.
    const wantedDepartmentId =
      query.departmentId ?? query.preferDepartmentId ?? null
    const scopedUserIds = new Set<string>()
    const userIds: string[] = []
    const seen = new Set<string>()
    for (const holder of holders) {
      const id = holder.userId.toString()
      if (!seen.has(id)) {
        seen.add(id)
        userIds.push(id)
      }
      if (
        wantedDepartmentId !== null &&
        holder.departmentId !== null &&
        holder.departmentId.toString() === wantedDepartmentId
      )
        scopedUserIds.add(id)
    }

    const loads = await this.prisma.requestStepInstance.groupBy({
      by: ['assignedToUserId'],
      where: {
        assignedToUserId: { in: userIds },
        status: { in: OPEN_STATUSES },
      },
      _count: { _all: true },
    })
    const loadByUser = new Map<string, number>()
    for (const row of loads)
      if (row.assignedToUserId !== null)
        loadByUser.set(row.assignedToUserId.toString(), row._count._all)

    const candidates: AssigneeCandidate[] = userIds.map((id) => ({
      userId: id,
      openStepCount: loadByUser.get(id) ?? 0,
      scoped: scopedUserIds.has(id),
    }))

    // Locality beats workload, and it is not a tie-break -- it is a filter.
    //
    // Scoping a role to a unit is a statement that that unit's work belongs to
    // that desk. Ranking the local holder and a university-wide holder together
    // by open-step count alone meant the local desk was preferred only until it
    // was one item busier than the global one, so the first couple of requests
    // routed correctly and the next one silently left the department. Load
    // balancing is the right rule *within* a tier and the wrong rule across it.
    //
    // The global tier is still a real fallback: it is used whenever the
    // department has nobody eligible, which is the case this OR existed for.
    const scopedCandidates = candidates.filter((c) => c.scoped)
    const pool = scopedCandidates.length > 0 ? scopedCandidates : candidates

    pool.sort((a, b) => {
      if (a.openStepCount !== b.openStepCount)
        return a.openStepCount - b.openStepCount
      const ai = a.userId
      const bi = b.userId
      return ai < bi ? -1 : ai > bi ? 1 : 0
    })
    return pool
  }

  async findActiveDelegations(on: Date): Promise<Map<string, string>> {
    // start_date/end_date are DATE columns, so the comparison is by calendar
    // day. Truncating avoids a delegation that ends today being treated as
    // already expired at 09:00 because `on` carries a time component.
    const day = new Date(
      Date.UTC(on.getUTCFullYear(), on.getUTCMonth(), on.getUTCDate()),
    )

    const rows = await this.prisma.delegation.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        startDate: { lte: day },
        endDate: { gte: day },
        // A delegation to someone who has since left is not a delegation.
        delegate: { status: 'ACTIVE', deletedAt: null },
        delegator: { deletedAt: null },
      },
      select: { delegatorId: true, delegateId: true },
      orderBy: { createdAt: 'asc' },
    })

    const byDelegator = new Map<string, string>()
    // Ascending order means the last write wins, so if someone has two open
    // delegations the most recently granted one takes effect.
    for (const row of rows)
      byDelegator.set(row.delegatorId.toString(), row.delegateId.toString())
    return byDelegator
  }

  findRoleHolders(query: {
    roleId: string
    excludeUserId?: string
  }): Promise<AssigneeCandidate[]> {
    // Same query as findCandidates with the department constraint dropped, so
    // the workload counts and least-busy-first ordering stay consistent between
    // the automatic list and the manual one.
    return this.findCandidates({
      roleId: query.roleId,
      excludeUserId: query.excludeUserId,
    })
  }

  async isAssignable(userId: string): Promise<boolean> {
    const row = await this.prisma.user.findFirst({
      where: { id: userId, status: 'ACTIVE', deletedAt: null },
      select: { id: true },
    })
    return row !== null
  }

  async getUserDepartmentId(userId: string): Promise<string | null> {
    const row = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { departmentId: true },
    })
    return row && row.departmentId !== null ? row.departmentId.toString() : null
  }

  async findFacultyId(departmentId: string): Promise<string | null> {
    let currentId: string | null = departmentId
    const visited = new Set<string>()
    while (currentId !== null) {
      const key = currentId.toString()
      if (visited.has(key)) break
      visited.add(key)

      const row = await this.prisma.department.findFirst({
        where: { id: currentId, deletedAt: null },
        include: { unitType: true },
      })
      if (!row) return null
      if (row.unitType.code === FACULTY_KIND) return row.id.toString()
      currentId = row.parentId
    }
    return null
  }

  async getParentDepartmentId(departmentId: string): Promise<string | null> {
    const row = await this.prisma.department.findFirst({
      where: { id: departmentId, deletedAt: null },
      select: { parentId: true },
    })
    return row && row.parentId !== null ? row.parentId.toString() : null
  }
}
