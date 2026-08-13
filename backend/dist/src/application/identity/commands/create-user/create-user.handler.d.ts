import { ICommandHandler } from '@nestjs/cqrs';
import type { UserRepository } from '../../../../domain/identity/ports/user.repository';
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository';
import type { PasswordHasher } from '../../../../domain/identity/ports/password-hasher';
import type { DepartmentRepository } from '../../../../domain/organization/ports/department.repository';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import type { TransactionRunner } from '../../../../domain/shared/transaction-runner';
import { UserTypeAttributeWriter } from '../../services/user-type-attribute.writer';
import { CreateUserCommand } from './create-user.command';
export interface CreateUserResult {
    id: string;
    institutionalNumber: string;
}
export declare class CreateUserHandler implements ICommandHandler<CreateUserCommand, CreateUserResult> {
    private readonly users;
    private readonly roles;
    private readonly departments;
    private readonly hasher;
    private readonly ids;
    private readonly transaction;
    private readonly userTypeAttribute;
    constructor(users: UserRepository, roles: RoleRepository, departments: DepartmentRepository, hasher: PasswordHasher, ids: IdGenerator, transaction: TransactionRunner, userTypeAttribute: UserTypeAttributeWriter);
    execute({ input }: CreateUserCommand): Promise<CreateUserResult>;
}
