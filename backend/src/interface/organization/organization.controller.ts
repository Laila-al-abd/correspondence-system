import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { SyncDepartmentsCommand } from '../../application/organization/commands/sync-departments/sync-departments.command'
import { SyncDepartmentsResult } from '../../application/organization/sync-departments-from-directory'
import { SyncDepartmentsDto } from './dto/sync-departments.dto'
import { CreateDepartmentCommand } from '../../application/organization/commands/create-department/create-department.command'
import { CreateDepartmentResult } from '../../application/organization/commands/create-department/create-department.handler'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { UpdateDepartmentCommand } from '../../application/organization/commands/update-department/update-department.command'
import { UpdateDepartmentResult } from '../../application/organization/commands/update-department/update-department.handler'
import { UpdateDepartmentDto } from './dto/update-department.dto'
import { ListDepartmentsDto } from './dto/list-departments.dto'
import {
  ListOrgUnitTypesQuery,
} from '../../application/organization/queries/list-org-unit-types/list-org-unit-types.query'
import { OrgUnitTypeView } from '../../application/organization/queries/list-org-unit-types/org-unit-type.view'
import type {
  DepartmentQueryPort,
  DepartmentTreeNode,
  DepartmentView,
} from '../../application/organization/ports/department-query.port'
import { DEPARTMENT_QUERY } from '../../application/tokens'
import { OffsetPage } from '../../application/shared/pagination'
import { toNumber } from '../shared/dto/page-query.dto'
import { EntityNotFoundError } from '../../application/errors'
import { RequirePermissions } from '../identity/permissions.decorator'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

@Controller('organization/departments')
@RequirePermissions('user.manage')
export class OrganizationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(DEPARTMENT_QUERY)
    private readonly departments: DepartmentQueryPort,
  ) {}

  @Post('sync')
  sync(@Body() dto: SyncDepartmentsDto): Promise<SyncDepartmentsResult> {
    return this.commandBus.execute(new SyncDepartmentsCommand(dto.source))
  }

  @Post()
  create(@Body() dto: CreateDepartmentDto): Promise<CreateDepartmentResult> {
    return this.commandBus.execute(
      new CreateDepartmentCommand({
        unitTypeCode: dto.unitTypeCode,
        name: dto.name,
        description: dto.description,
        parentId: dto.parentId,
      }),
    )
  }

  /**
   * Rename a unit, or edit its description.
   *
   * Nothing routing reads is editable here. The parent link and the
   * org-unit type both steer the head and dean escalation walks, so
   * changing either would redirect the remaining steps of requests already
   * in flight; the handler explains why that is left to the sync.
   */
  @Patch(':id')
  updateOne(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<UpdateDepartmentResult> {
    // Same guard as getOne: a non-uuid must be a clean 404 rather than a
    // driver error surfacing as a 500.
    if (!UUID_PATTERN.test(id)) throw new EntityNotFoundError('Department', id)
    return this.commandBus.execute(
      new UpdateDepartmentCommand({
        id,
        name: dto.name,
        description: dto.description,
      }),
    )
  }

  // Flat list, optionally filtered by name substring, parent, or active state.
  @Get()
  list(@Query() dto: ListDepartmentsDto): Promise<OffsetPage<DepartmentView>> {
    return this.departments.list({
      search: dto.search,
      parentId: dto.parentId,
      activeOnly: dto.activeOnly === 'true',
      limit: toNumber(dto.limit),
      offset: toNumber(dto.offset),
    })
  }

  // Nested hierarchy (roots with their children). Declared before ':id' so the
  // literal path is matched first.
  @Get('tree')
  tree(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<DepartmentTreeNode[]> {
    return this.departments.tree(activeOnly === 'true')
  }

  // Declared before ':id'. Nest matches routes in declaration order, so a
  // literal segment registered after a parameter route is unreachable: the
  // request lands in getOne() with id === 'unit-types' and Postgres rejects it
  // as an invalid uuid (a 500, not a 404).
  @Get('unit-types')
  listUnitTypes(): Promise<OrgUnitTypeView[]> {
    return this.queryBus.execute(new ListOrgUnitTypesQuery())
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<DepartmentView> {
    // Defence in depth for the bug above. Any future literal route added below
    // this one still yields a clean 404 instead of leaking a driver error.
    if (!UUID_PATTERN.test(id)) throw new EntityNotFoundError('Department', id)
    const found = await this.departments.getById(id)
    if (!found) throw new EntityNotFoundError('Department', id)
    return found
  }
}
