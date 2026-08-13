import type { UserRepository } from '../../domain/identity/ports/user.repository';
import type { DepartmentRepository, PersonnelDirectory } from '../../domain/organization/ports/department.repository';
import type { IdGenerator } from '../../domain/shared/id-generator';
import type { TransactionRunner } from '../../domain/shared/transaction-runner';
import type { UserTypeAttributeWriter } from './services/user-type-attribute.writer';
export interface SyncUsersResult {
    source: string;
    created: number;
    updated: number;
    upgraded: number;
    total: number;
    skipped: Array<{
        institutionalNumber: string;
        reason: string;
    }>;
    unresolvedDepartments: string[];
}
export declare class SyncUsersFromDirectory {
    private readonly directory;
    private readonly users;
    private readonly departments;
    private readonly ids;
    private readonly transaction;
    private readonly userTypeAttribute;
    constructor(directory: PersonnelDirectory, users: UserRepository, departments: DepartmentRepository, ids: IdGenerator, transaction: TransactionRunner, userTypeAttribute: UserTypeAttributeWriter);
    execute(source: string): Promise<SyncUsersResult>;
    private write;
    private resolveDepartment;
}
