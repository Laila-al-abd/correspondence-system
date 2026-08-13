import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SyncDepartmentsResult } from '../../application/organization/sync-departments-from-directory';
import { SyncDepartmentsDto } from './dto/sync-departments.dto';
import { CreateDepartmentResult } from '../../application/organization/commands/create-department/create-department.handler';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { ListDepartmentsDto } from './dto/list-departments.dto';
import { OrgUnitTypeView } from '../../application/organization/queries/list-org-unit-types/org-unit-type.view';
import type { DepartmentQueryPort, DepartmentTreeNode, DepartmentView } from '../../application/organization/ports/department-query.port';
import { OffsetPage } from '../../application/shared/pagination';
export declare class OrganizationController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly departments;
    constructor(commandBus: CommandBus, queryBus: QueryBus, departments: DepartmentQueryPort);
    sync(dto: SyncDepartmentsDto): Promise<SyncDepartmentsResult>;
    create(dto: CreateDepartmentDto): Promise<CreateDepartmentResult>;
    list(dto: ListDepartmentsDto): Promise<OffsetPage<DepartmentView>>;
    tree(activeOnly?: string): Promise<DepartmentTreeNode[]>;
    listUnitTypes(): Promise<OrgUnitTypeView[]>;
    getOne(id: string): Promise<DepartmentView>;
}
