import { Injectable } from '@nestjs/common'
import { OrgUnitType } from '../../domain/organization/org-unit-type'
import { OrgUnitTypeRepository } from '../../domain/organization/ports/org-unit-type.repository'
import { PrismaService } from '../persistence/prisma.service'
import { OrgUnitTypeMapper } from './org-unit-type.mapper'

/**
 * Prisma-backed OrgUnitTypeRepository over the `org_unit_types` table. Used by
 * the department sync to resolve an external unit-type code to its internal id.
 */
@Injectable()
export class PrismaOrgUnitTypeRepository implements OrgUnitTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCode(code: string): Promise<OrgUnitType | null> {
    const row = await this.prisma.orgUnitType.findFirst({
      where: { code, deletedAt: null },
    })
    return row ? OrgUnitTypeMapper.toDomain(row) : null
  }
}
