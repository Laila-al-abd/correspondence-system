import { Injectable } from '@nestjs/common'
import { Department } from '../../domain/organization/department'
import { DepartmentRepository } from '../../domain/organization/ports/department.repository'
import { ExternalRef } from '../../domain/organization/value-objects/external-ref'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { DepartmentMapper } from './department.mapper'

/**
 * Prisma-backed DepartmentRepository over the `departments` table. Soft-deleted
 * rows (deleted_at set) are treated as absent. Ids are app-assigned, so save()
 * upserts on the explicit id.
 */
@Injectable()
export class PrismaDepartmentRepository implements DepartmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<Department | null> {
    const row = await this.prisma.department.findFirst({
      where: { id: BigInt(id.toString()), deletedAt: null },
    })
    return row ? DepartmentMapper.toDomain(row) : null
  }

  async findByExternalRef(ref: ExternalRef): Promise<Department | null> {
    const row = await this.prisma.department.findFirst({
      where: { externalId: ref.id, deletedAt: null },
    })
    return row ? DepartmentMapper.toDomain(row) : null
  }

  /**
   * Walks the hierarchy upward from `departmentId` and returns the first unit
   * (including the starting one) whose org-unit type code matches `kind` — e.g.
   * the FACULTY that owns a given department. A visited-set guards against
   * accidental parent cycles.
   */
  async findAncestorOfKind(
    departmentId: Identifier,
    kind: string,
  ): Promise<Department | null> {
    let currentId: bigint | null = BigInt(departmentId.toString())
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
      if (row.unitType.code === kind) return DepartmentMapper.toDomain(row)
      currentId = row.parentId
    }
    return null
  }

  async listChildren(parentId: Identifier): Promise<Department[]> {
    const rows = await this.prisma.department.findMany({
      where: { parentId: BigInt(parentId.toString()), deletedAt: null },
      orderBy: { id: 'asc' },
    })
    return rows.map((row) => DepartmentMapper.toDomain(row))
  }

  async save(department: Department): Promise<void> {
    const data = DepartmentMapper.toPersistence(department)
    await this.prisma.department.upsert({
      where: { id: BigInt(department.id.toString()) },
      create: data,
      update: data,
    })
  }
}
