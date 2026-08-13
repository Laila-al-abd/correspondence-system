import type { DepartmentQueryPort, DepartmentTreeNode, DepartmentView, ListDepartmentsFilter } from '../../application/organization/ports/department-query.port';
import { OffsetPage } from '../../application/shared/pagination';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaDepartmentQuery implements DepartmentQueryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filter: ListDepartmentsFilter): Promise<OffsetPage<DepartmentView>>;
    getById(id: string): Promise<DepartmentView | null>;
    tree(activeOnly: boolean): Promise<DepartmentTreeNode[]>;
}
