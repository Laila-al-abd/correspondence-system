import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { SyncDepartmentsCommand } from '../../application/organization/commands/sync-departments/sync-departments.command'
import { SyncDepartmentsResult } from '../../application/organization/sync-departments-from-directory'
import { SyncDepartmentsDto } from './dto/sync-departments.dto'
import { CreateDepartmentCommand } from '../../application/organization/commands/create-department/create-department.command'
import { CreateDepartmentResult } from '../../application/organization/commands/create-department/create-department.handler'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { ListDepartmentsDto } from './dto/list-departments.dto'
import type {
  DepartmentQueryPort,
  DepartmentTreeNode,
  DepartmentView,
} from '../../application/organization/ports/department-query.port'
import { DEPARTMENT_QUERY } from '../../application/tokens'
import { EntityNotFoundError } from '../../application/errors'
import { RequirePermissions } from '../identity/permissions.decorator'

@Controller('organization/departments')
@RequirePermissions('user.manage')
export class OrganizationController {
  constructor(
    private readonly commandBus: CommandBus,
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

  // Flat list, optionally filtered by name substring, parent, or active state.
  @Get()
  list(@Query() dto: ListDepartmentsDto): Promise<DepartmentView[]> {
    return this.departments.list({
      search: dto.search,
      parentId: dto.parentId,
      activeOnly: dto.activeOnly === 'true',
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

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<DepartmentView> {
    const found = await this.departments.getById(id)
    if (!found) throw new EntityNotFoundError('Department', id)
    return found
  }
}
