import { Module } from '@nestjs/common'
import { PrismaDepartmentRepository } from '../../infrastructure/organization/prisma-department.repository'
import { PrismaOrgUnitTypeRepository } from '../../infrastructure/organization/prisma-org-unit-type.repository'
import {
  DEPARTMENT_REPOSITORY,
  ORG_UNIT_TYPE_REPOSITORY,
} from '../../application/tokens'

/**
 * Organization composition root. Binds the DEPARTMENT_REPOSITORY port to its
 * Prisma adapter and exports it so other contexts (Identity, Workflow, Request)
 * can resolve departments through the same port.
 */
@Module({
  providers: [
    { provide: DEPARTMENT_REPOSITORY, useClass: PrismaDepartmentRepository },
    {
      provide: ORG_UNIT_TYPE_REPOSITORY,
      useClass: PrismaOrgUnitTypeRepository,
    },
  ],
  exports: [DEPARTMENT_REPOSITORY, ORG_UNIT_TYPE_REPOSITORY],
})
export class OrganizationModule {}
