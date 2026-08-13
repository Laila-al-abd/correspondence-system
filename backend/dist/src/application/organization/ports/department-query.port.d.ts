import { OffsetPage } from '../../shared/pagination';
export interface DepartmentUnitTypeView {
    id: string;
    code: string;
    name: {
        ar: string;
        en?: string;
    };
}
export interface DepartmentView {
    id: string;
    parentId: string | null;
    unitType: DepartmentUnitTypeView;
    name: {
        ar: string;
        en?: string;
    };
    description: {
        ar: string;
        en?: string;
    } | null;
    isActive: boolean;
    sourceSystem: string;
    externalId: string | null;
    lastSyncedAt: string | null;
}
export interface DepartmentTreeNode extends DepartmentView {
    children: DepartmentTreeNode[];
}
export interface ListDepartmentsFilter {
    search?: string;
    parentId?: string;
    activeOnly?: boolean;
    limit?: number;
    offset?: number;
}
export interface DepartmentQueryPort {
    list(filter: ListDepartmentsFilter): Promise<OffsetPage<DepartmentView>>;
    getById(id: string): Promise<DepartmentView | null>;
    tree(activeOnly: boolean): Promise<DepartmentTreeNode[]>;
}
