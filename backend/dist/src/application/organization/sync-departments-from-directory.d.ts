import type { DepartmentRepository, PersonnelDirectory } from '../../domain/organization/ports/department.repository';
import type { OrgUnitTypeRepository } from '../../domain/organization/ports/org-unit-type.repository';
import type { IdGenerator } from '../../domain/shared/id-generator';
import type { TransactionRunner } from '../../domain/shared/transaction-runner';
export interface SyncDepartmentsResult {
    source: string;
    created: number;
    updated: number;
    deactivated: number;
    total: number;
}
export declare class SyncDepartmentsFromDirectory {
    private readonly directory;
    private readonly departments;
    private readonly unitTypes;
    private readonly ids;
    private readonly transaction;
    constructor(directory: PersonnelDirectory, departments: DepartmentRepository, unitTypes: OrgUnitTypeRepository, ids: IdGenerator, transaction: TransactionRunner);
    execute(source: string): Promise<SyncDepartmentsResult>;
    private write;
}
