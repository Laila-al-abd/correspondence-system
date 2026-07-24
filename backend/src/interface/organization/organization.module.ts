import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { PrismaDepartmentRepository } from '../../infrastructure/organization/prisma-department.repository'
import { PrismaOrgUnitTypeRepository } from '../../infrastructure/organization/prisma-org-unit-type.repository'
import { HttpPersonnelDirectory } from '../../infrastructure/organization/http-personnel-directory'
import { IncrementingIdGenerator } from '../../infrastructure/shared/incrementing-id.generator'
import { SyncDepartmentsFromDirectory } from '../../application/organization/sync-departments-from-directory'
import { SyncDepartmentsHandler } from '../../application/organization/commands/sync-departments/sync-departments.handler'
import {
  DEPARTMENT_REPOSITORY,
  ID_GENERATOR,
  ORG_UNIT_TYPE_REPOSITORY,
  PERSONNEL_DIRECTORY,
} from '../../application/tokens'
import { OrganizationController } from './organization.controller'

/**
 * Organization composition root. Binds the department and org-unit-type ports
 * to their Prisma adapters (exported so other contexts can resolve them), wires
 * the external personnel directory (HTTP + YAML adapter) to the idempotent
 * department sync, and exposes that sync over HTTP.
 */
@Module({
  imports: [CqrsModule],
  controllers: [OrganizationController],
  providers: [
    SyncDepartmentsHandler,
    { provide: DEPARTMENT_REPOSITORY, useClass: PrismaDepartmentRepository },
    {
      provide: ORG_UNIT_TYPE_REPOSITORY,
      useClass: PrismaOrgUnitTypeRepository,
    },
    { provide: PERSONNEL_DIRECTORY, useClass: HttpPersonnelDirectory },
    { provide: ID_GENERATOR, useClass: IncrementingIdGenerator },
    {
      provide: SyncDepartmentsFromDirectory,
      useFactory: (
        directory: HttpPersonnelDirectory,
        departments: PrismaDepartmentRepository,
        unitTypes: PrismaOrgUnitTypeRepository,
        ids: IncrementingIdGenerator,
      ) =>
        new SyncDepartmentsFromDirectory(
          directory,
          departments,
          unitTypes,
          ids,
        ),
      inject: [
        PERSONNEL_DIRECTORY,
        DEPARTMENT_REPOSITORY,
        ORG_UNIT_TYPE_REPOSITORY,
        ID_GENERATOR,
      ],
    },
  ],
  exports: [DEPARTMENT_REPOSITORY, ORG_UNIT_TYPE_REPOSITORY],
})
export class OrganizationModule {}
