import { Injectable } from '@nestjs/common'
import { Prisma } from '../../../generated/prisma/client'
import type { Permission as PermissionRow } from '../../../generated/prisma/client'
import type {
  LocalizedTextView,
  PermissionGroupView,
  PermissionView,
  RoleDetailView,
  RoleQueryPort,
  RoleSummaryView,
} from '../../application/identity/ports/role-query.port'
import { PrismaService } from '../persistence/prisma.service'

const withCounts = {
  _count: { select: { permissions: true, userRoles: true } },
} satisfies Prisma.RoleInclude

const withPermissions = {
  _count: { select: { permissions: true, userRoles: true } },
  permissions: { include: { permission: true } },
} satisfies Prisma.RoleInclude

type RoleCountsRow = Prisma.RoleGetPayload<{ include: typeof withCounts }>
type RoleDetailRow = Prisma.RoleGetPayload<{ include: typeof withPermissions }>

/**
 * Prisma-backed read model for roles and the permission vocabulary. Nothing here
 * mutates state.
 */
@Injectable()
export class PrismaRoleQuery implements RoleQueryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listRoles(): Promise<RoleSummaryView[]> {
    const rows = await this.prisma.role.findMany({
      where: { deletedAt: null },
      include: withCounts,
      // Built-in roles first, then whatever the super admin has added, oldest
      // first. createdAt is not unique under a bulk seed, so id breaks the tie.
      orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }, { id: 'asc' }],
    })
    return rows.map((row) => toSummary(row))
  }

  async getRole(id: string): Promise<RoleDetailView | null> {
    const row = await this.prisma.role.findFirst({
      where: { id, deletedAt: null },
      include: withPermissions,
    })
    if (!row) return null
    return {
      ...toSummary(row),
      permissions: row.permissions
        .map((rp) => toPermission(rp.permission))
        .sort((a, b) => a.code.localeCompare(b.code)),
    }
  }

  async listPermissionGroups(): Promise<PermissionGroupView[]> {
    const groups = await this.prisma.permissionGroup.findMany({
      include: { permissions: { orderBy: { code: 'asc' } } },
      orderBy: { id: 'asc' },
    })
    return groups.map((group) => ({
      id: group.id,
      name: text(group.name),
      description: optionalText(group.description),
      permissions: group.permissions.map((permission) =>
        toPermission(permission),
      ),
    }))
  }
}

// The JSONB columns hold { ar, en } by convention; Prisma types them as JsonValue.
const text = (value: Prisma.JsonValue): LocalizedTextView =>
  value as unknown as LocalizedTextView

const optionalText = (
  value: Prisma.JsonValue | null,
): LocalizedTextView | null => (value === null ? null : text(value))

function toSummary(row: RoleCountsRow): RoleSummaryView {
  return {
    id: row.id.toString(),
    name: text(row.name),
    description: optionalText(row.description),
    isSystem: row.isSystem,
    permissionCount: row._count.permissions,
    assignmentCount: row._count.userRoles,
    createdAt: row.createdAt.toISOString(),
  }
}

function toPermission(row: PermissionRow): PermissionView {
  return {
    id: row.id.toString(),
    code: row.code,
    name: text(row.name),
    description: optionalText(row.description),
  }
}
