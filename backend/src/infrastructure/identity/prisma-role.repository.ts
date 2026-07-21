import { Injectable } from '@nestjs/common'
import { Role } from '../../domain/identity/role'
import { RoleRepository } from '../../domain/identity/ports/role.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { RoleMapper } from './role.mapper'

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
      where: { id: BigInt(id.toString()), deletedAt: null },
      include: { permissions: { include: { permission: true } } },
    })
    if (!row) return null
    const codes = row.permissions.map((rp) => rp.permission.code)
    return RoleMapper.toDomain(row, codes)
  }

  async save(role: Role): Promise<void> {
    const data = RoleMapper.toPersistence(role)
    const roleId = BigInt(role.id.toString())
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
              userId: BigInt(userId.toString()),
              OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
            },
          },
        },
      },
      include: { permission: true },
    })
    return new Set(rows.map((rp) => rp.permission.code))
  }
}
