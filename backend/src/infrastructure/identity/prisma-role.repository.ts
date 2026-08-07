import { Injectable } from '@nestjs/common'
import { Role } from '../../domain/identity/role'
import { RoleRepository } from '../../domain/identity/ports/role.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { RoleMapper } from './role.mapper'
import { activeRoleAssignment, liveRole } from './role-access.where'

/**
 * Prisma-backed RoleRepository. A role and its permission assignments span two
 * tables (`roles`, `role_permissions`), so save() runs in a transaction and
 * re-syncs the join rows from the aggregate's permission codes.
 */
@Injectable()
export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<Role | null> {
    const row = await this.prisma.role.findFirst({
      where: { id: id.toString(), deletedAt: null },
      include: { permissions: { include: { permission: true } } },
    })
    if (!row) return null
    const codes = row.permissions.map((rp) => rp.permission.code)
    return RoleMapper.toDomain(row, codes)
  }

  async save(role: Role): Promise<void> {
    const data = RoleMapper.toPersistence(role)
    const roleId = role.id.toString()
    const codes = role.permissions

    await this.prisma.$transaction(async (tx) => {
      await tx.role.upsert({
        where: { id: roleId },
        create: data,
        update: data,
      })

      const permissions = codes.length
        ? await tx.permission.findMany({ where: { code: { in: codes } } })
        : []

      await tx.rolePermission.deleteMany({ where: { roleId } })
      if (permissions.length) {
        await tx.rolePermission.createMany({
          data: permissions.map((p) => ({ roleId, permissionId: p.id })),
          skipDuplicates: true,
        })
      }
    })
  }

  async effectivePermissions(userId: Identifier): Promise<Set<string>> {
    const now = new Date()
    const rows = await this.prisma.rolePermission.findMany({
      where: {
        role: {
          deletedAt: null,
          userRoles: {
            some: {
              userId: userId.toString(),
              ...activeRoleAssignment(now),
            },
          },
        },
      },
      include: { permission: true },
    })
    return new Set(rows.map((rp) => rp.permission.code))
  }

  async roleCarries(roleId: Identifier, permissionCode: string): Promise<boolean> {
    const match = await this.prisma.rolePermission.findFirst({
      where: {
        roleId: roleId.toString(),
        role: liveRole,
        permission: { code: permissionCode },
      },
      select: { roleId: true },
    })
    return match !== null
  }

  /**
   * Counts the users who can still exercise a permission right now.
   *
   * The filters are not incidental: an assignment that has expired, a role that
   * has been soft-deleted, a user who has been soft-deleted, and a user who is
   * suspended all produce someone who *looks* like an administrator in the
   * user_roles table but cannot actually log in and use the permission. Counting
   * any of them would let the system be left with an administrator who cannot
   * administer it, which is the exact failure this count exists to prevent.
   *
   * `distinct` matters because one user holding a permission through two roles
   * is one holder, not two.
   */
  async countHoldersOf(
    permissionCode: string,
    options?: { excludingUserId?: Identifier; excludingRoleId?: Identifier },
  ): Promise<number> {
    const excluded = options?.excludingUserId?.toString()
    const excludedRole = options?.excludingRoleId?.toString()
    const rows = await this.prisma.userRole.findMany({
      where: {
        ...activeRoleAssignment(new Date()),
        ...(excluded ? { userId: { not: excluded } } : {}),
        ...(excludedRole ? { roleId: { not: excludedRole } } : {}),
        role: {
          ...liveRole,
          permissions: { some: { permission: { code: permissionCode } } },
        },
        user: { deletedAt: null, status: 'ACTIVE' },
      },
      select: { userId: true },
      distinct: ['userId'],
    })
    return rows.length
  }

  /**
   * Which of the given codes name no permission at all.
   *
   * save() resolves permission codes to rows and writes join rows only for the
   * ones it finds, so an unchecked typo produces a role that reads correctly in
   * the admin screen and grants nothing. Checking here turns that into a 400.
   */
  async unknownPermissionCodes(codes: string[]): Promise<string[]> {
    const wanted = [...new Set(codes)]
    if (wanted.length === 0) return []
    const found = await this.prisma.permission.findMany({
      where: { code: { in: wanted } },
      select: { code: true },
    })
    const known = new Set(found.map((p) => p.code))
    return wanted.filter((code) => !known.has(code))
  }

  /**
   * Assignments pointing at this role, expired ones included.
   *
   * Expired ones count on purpose. They are the record of who held the role and
   * until when, and retiring a role that still has rows referencing it would
   * leave that history pointing at something the admin screen no longer lists.
   * Revoke first, retire second.
   */
  async countAssignments(roleId: Identifier): Promise<number> {
    return this.prisma.userRole.count({
      where: { roleId: roleId.toString() },
    })
  }

  async assignToUser(params: {
    userId: Identifier
    roleId: Identifier
    departmentId?: Identifier
    reason?: string
    expiresAt?: Date
    assignedBy?: Identifier
  }): Promise<void> {
    const where = {
      userId: params.userId.toString(),
      roleId: params.roleId.toString(),
      departmentId: params.departmentId
        ? params.departmentId.toString()
        : null,
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where })
      await tx.userRole.create({
        data: {
          ...where,
          reason: params.reason ?? null,
          expiresAt: params.expiresAt ?? null,
          assignedBy: params.assignedBy
            ? params.assignedBy.toString()
            : null,
        },
      })
    })
  }

  async revokeFromUser(params: {
    userId: Identifier
    roleId: Identifier
    departmentId?: Identifier
  }): Promise<void> {
    await this.prisma.userRole.deleteMany({
      where: {
        userId: params.userId.toString(),
        roleId: params.roleId.toString(),
        departmentId: params.departmentId
          ? params.departmentId.toString()
          : null,
      },
    })
  }
}
