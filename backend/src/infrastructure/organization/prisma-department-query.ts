import { Injectable } from '@nestjs/common'
import {
  Prisma,
  Department as DepartmentRow,
  OrgUnitType as OrgUnitTypeRow,
} from '../../../generated/prisma/client'
import type {
  DepartmentQueryPort,
  DepartmentTreeNode,
  DepartmentView,
  ListDepartmentsFilter,
} from '../../application/organization/ports/department-query.port'
import {
  OffsetPage,
  clampLimit,
  clampOffset,
} from '../../application/shared/pagination'
import { PrismaService } from '../persistence/prisma.service'

type RowWithType = DepartmentRow & { unitType: OrgUnitTypeRow }

/**
 * Prisma-backed read model for departments. It reads the `departments` table
 * with its org-unit type joined in and maps each row to a flat DepartmentView.
 * Search is a substring match over the bilingual JSONB name; the tree is built
 * in memory from a single ordered fetch (no recursive SQL), which is ample for
 * a university-sized hierarchy.
 */
@Injectable()
export class PrismaDepartmentQuery implements DepartmentQueryPort {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: ListDepartmentsFilter): Promise<OffsetPage<DepartmentView>> {
    const limit = clampLimit(filter.limit)
    const offset = clampOffset(filter.offset)
    const where: Prisma.DepartmentWhereInput = { deletedAt: null }
    if (filter.activeOnly) where.isActive = true
    if (filter.parentId) where.parentId = filter.parentId
    if (filter.search) {
      const term = filter.search
      where.OR = [
        { name: { path: ['ar'], string_contains: term } },
        { name: { path: ['en'], string_contains: term } },
      ]
    }
    const [total, rows] = await Promise.all([
      this.prisma.department.count({ where }),
      this.prisma.department.findMany({
        where,
        include: { unitType: true },
        orderBy: { id: 'asc' },
        skip: offset,
        take: limit,
      }),
    ])
    return { total, limit, offset, items: rows.map((row) => toView(row)) }
  }

  async getById(id: string): Promise<DepartmentView | null> {
    const row = await this.prisma.department.findFirst({
      where: { id: id, deletedAt: null },
      include: { unitType: true },
    })
    return row ? toView(row) : null
  }

  async tree(activeOnly: boolean): Promise<DepartmentTreeNode[]> {
    const where: Prisma.DepartmentWhereInput = { deletedAt: null }
    if (activeOnly) where.isActive = true
    const rows = await this.prisma.department.findMany({
      where,
      include: { unitType: true },
      orderBy: { id: 'asc' },
    })

    const nodes = new Map<string, DepartmentTreeNode>()
    for (const row of rows)
      nodes.set(row.id.toString(), { ...toView(row), children: [] })

    const roots: DepartmentTreeNode[] = []
    for (const node of nodes.values()) {
      const parent = node.parentId ? nodes.get(node.parentId) : undefined
      if (parent) parent.children.push(node)
      else roots.push(node)
    }
    return roots
  }
}

function toLocalized(
  value: Prisma.JsonValue | null,
): { ar: string; en?: string } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as { ar?: string; en?: string }
  return { ar: record.ar ?? '', en: record.en }
}

function toView(row: RowWithType): DepartmentView {
  return {
    id: row.id.toString(),
    parentId: row.parentId ? row.parentId.toString() : null,
    unitType: {
      id: row.unitType.id.toString(),
      code: row.unitType.code,
      name: toLocalized(row.unitType.name) ?? { ar: '' },
    },
    name: toLocalized(row.name) ?? { ar: '' },
    description: toLocalized(row.description ?? null),
    isActive: row.isActive,
    sourceSystem: row.sourceSystem,
    externalId: row.externalId ?? null,
    lastSyncedAt: row.lastSyncedAt ? row.lastSyncedAt.toISOString() : null,
  }
}
