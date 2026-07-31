import { Injectable } from '@nestjs/common'
import { Prisma } from '../../../generated/prisma/client'
import type {
  ListUsersFilter,
  ListUsersResult,
  UserAttributeView,
  UserDetailView,
  UserQueryPort,
  UserRoleView,
  UserSummaryView,
} from '../../application/identity/ports/user-query.port'
import { PrismaService } from '../persistence/prisma.service'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

/**
 * Prisma-backed read model for the admin user directory. `list` runs a
 * filtered, paginated query (count + page) over the `users` table; `getDetail`
 * loads one user with their non-deleted role assignments and ABAC attribute
 * values joined in. Nothing here mutates state.
 */
@Injectable()
export class PrismaUserQuery implements UserQueryPort {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: ListUsersFilter): Promise<ListUsersResult> {
    const limit = Math.min(
      Math.max(filter.limit ?? DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    )
    const offset = Math.max(filter.offset ?? 0, 0)

    const where: Prisma.UserWhereInput = { deletedAt: null }
    if (filter.userType) where.userType = filter.userType
    if (filter.status) where.status = filter.status
    if (filter.departmentId) where.departmentId = filter.departmentId
    if (filter.search) {
      const contains = { contains: filter.search, mode: 'insensitive' as const }
      where.OR = [
        { fullNameAr: contains },
        { fullNameEn: contains },
        { email: contains },
        { institutionalNumber: contains },
      ]
    }

    const [total, rows] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { id: 'asc' },
        skip: offset,
        take: limit,
      }),
    ])

    return { total, limit, offset, items: rows.map((row) => toSummary(row)) }
  }

  async getDetail(id: string): Promise<UserDetailView | null> {
    const row = await this.prisma.user.findFirst({
      where: { id: id, deletedAt: null },
      include: {
        rolesAssigned: { include: { role: true } },
        attributes: { include: { attribute: true } },
      },
    })
    if (!row) return null

    const roles: UserRoleView[] = row.rolesAssigned
      .filter((ur) => !ur.role.deletedAt)
      .map((ur) => ({
        roleId: ur.roleId.toString(),
        roleName: toLocalized(ur.role.name) ?? { ar: '' },
        departmentId: ur.departmentId ? ur.departmentId.toString() : null,
        expiresAt: ur.expiresAt ? ur.expiresAt.toISOString() : null,
        assignedAt: ur.assignedAt.toISOString(),
      }))

    const attributes: UserAttributeView[] = row.attributes.map((ua) => ({
      attributeId: ua.attributeId.toString(),
      attributeCode: ua.attribute.code,
      value: ua.value,
    }))

    return {
      ...toSummary(row),
      applicantPurpose: row.applicantPurpose ?? null,
      roles,
      attributes,
    }
  }
}

function toLocalized(
  value: Prisma.JsonValue | null,
): { ar: string; en?: string } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as { ar?: string; en?: string }
  return { ar: record.ar ?? '', en: record.en }
}

function toSummary(row: {
  id: string
  userType: string
  fullNameAr: string
  fullNameEn: string | null
  email: string
  phone: string | null
  institutionalNumber: string | null
  departmentId: string | null
  status: string
  authProvider: string
  preferredLang: string
  createdAt: Date
}): UserSummaryView {
  return {
    id: row.id.toString(),
    userType: row.userType,
    fullNameAr: row.fullNameAr,
    fullNameEn: row.fullNameEn ?? null,
    email: row.email,
    phone: row.phone ?? null,
    institutionalNumber: row.institutionalNumber ?? null,
    departmentId: row.departmentId ? row.departmentId.toString() : null,
    status: row.status,
    authProvider: row.authProvider,
    preferredLang: row.preferredLang,
    createdAt: row.createdAt.toISOString(),
  }
}
