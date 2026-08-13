import { ICommandHandler } from '@nestjs/cqrs';
import type { UserRepository } from '../../../../domain/identity/ports/user.repository';
import type { PasswordHasher } from '../../../../domain/identity/ports/password-hasher';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import type { TransactionRunner } from '../../../../domain/shared/transaction-runner';
import { UserTypeAttributeWriter } from '../../services/user-type-attribute.writer';
import { RegisterUserCommand } from './register-user.command';
export interface RegisterUserResult {
    accepted: true;
}
export declare class RegisterUserHandler implements ICommandHandler<RegisterUserCommand, RegisterUserResult> {
    private readonly users;
    private readonly hasher;
    private readonly ids;
    private readonly transaction;
    private readonly userTypeAttribute;
    private readonly logger;
    constructor(users: UserRepository, hasher: PasswordHasher, ids: IdGenerator, transaction: TransactionRunner, userTypeAttribute: UserTypeAttributeWriter);
    execute({ input }: RegisterUserCommand): Promise<RegisterUserResult>;
}
