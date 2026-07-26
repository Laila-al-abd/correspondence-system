import { Injectable } from '@nestjs/common'
import { Prisma } from '../../../generated/prisma/client'
import type {
  AssigneeCandidate,
  AssigneeDirectoryPort,
  FindCandidatesQuery,
} from '../../application/request/ports/assignee-directory.port'
import { PrismaService } from '../persistence/prisma.service'

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
    const conditions: Prisma.UserRoleWhereInput[] = [
      { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    ]
    if (query.roleId) conditions.push({ roleId: BigInt(query.roleId) })
    if (query.departmentId) {
      const dept = BigInt(query.departmentId)
      conditions.push(
        query.requireScoped
          ? { departmentId: dept }
          : { OR: [{ departmentId: dept }, { departmentId: null }] },
      )
    }

    const userWhere: Prisma.UserWhereInput = {
      status: 'ACTIVE',
      deletedAt: null,
    }
    if (query.excludeUserId)
      userWhere.id = { not: BigInt(query.excludeUserId) }

    const holders = await this.prisma.userRole.findMany({
      where: { AND: conditions, user: userWhere },
      select: { userId: true },
      distinct: ['userId'],
    })
    const userIds = holders.map((h) => h.userId)
    if (userIds.length === 0) return []

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
      userId: id.toString(),
      openStepCount: loadByUser.get(id.toString()) ?? 0,
    }))
    candidates.sort((a, b) => {
      if (a.openStepCount !== b.openStepCount)
        return a.openStepCount - b.openStepCount
      const ai = BigInt(a.userId)
      const bi = BigInt(b.userId)
      return ai < bi ? -1 : ai > bi ? 1 : 0
    })
    return candidates
  }

  async getUserDepartmentId(userId: string): Promise<string | null> {
    const row = await this.prisma.user.findFirst({
      where: { id: BigInt(userId), deletedAt: null },
      select: { departmentId: true },
    })
    return row && row.departmentId !== null ? row.departmentId.toString() : null
  }

  async findFacultyId(departmentId: string): Promise<string | null> {
    let currentId: bigint | null = BigInt(departmentId)
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
      where: { id: BigInt(departmentId), deletedAt: null },
      select: { parentId: true },
    })
    return row && row.parentId !== null ? row.parentId.toString() : null
  }
}
