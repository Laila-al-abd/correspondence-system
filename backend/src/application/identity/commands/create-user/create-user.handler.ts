import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { User } from '../../../../domain/identity/user'
import { UserStatus, UserType } from '../../../../domain/identity/enums'
import { Email } from '../../../../domain/identity/value-objects/email'
import { PersonName } from '../../../../domain/identity/value-objects/person-name'
import { InstitutionalNumber } from '../../../../domain/identity/value-objects/institutional-number'
import type { UserRepository } from '../../../../domain/identity/ports/user.repository'
import type { RoleRepository } from '../../../../domain/identity/ports/role.repository'
import type { PasswordHasher } from '../../../../domain/identity/ports/password-hasher'
import type { DepartmentRepository } from '../../../../domain/organization/ports/department.repository'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import type { TransactionRunner } from '../../../../domain/shared/transaction-runner'
import { Identifier } from '../../../../domain/shared/identifier'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import {
  DEPARTMENT_REPOSITORY,
  ID_GENERATOR,
  PASSWORD_HASHER,
  ROLE_REPOSITORY,
  TRANSACTION_RUNNER,
  USER_REPOSITORY,
} from '../../../tokens'
import {
  EmailAlreadyInUseError,
  EntityNotFoundError,
  InstitutionalNumberAlreadyInUseError,
} from '../../../errors'
import { UserTypeAttributeWriter } from '../../services/user-type-attribute.writer'
import { CreateUserCommand } from './create-user.command'

export interface CreateUserResult {
  id: string
  institutionalNumber: string
}

/**
 * Administrator-provisioned staff and student accounts -- the only way an
 * account with an institutional number comes into existence by hand.
 *
 * Public self-registration is applicant-only and always will be: the DTO does
 * not carry a user type or an institutional number, the handler hard-codes
 * APPLICANT, and User.create refuses an applicant that has an institutional
 * number. So an employee who registers themselves gets an ordinary applicant
 * account with no privileges, and must wait to be provisioned here or imported
 * by the directory sync.
 *
 * Accounts made here are LOCAL: the administrator sets an initial password and
 * passes it to the person out of band. That is the working path for anyone the
 * personnel directory does not cover -- contractors, or the bootstrap admin --
 * whereas synced accounts authenticate against the directory and hold no
 * password at all.
 *
 * Unlike a duplicate email at self-registration, a duplicate here IS reported
 * as a conflict. There is no enumeration risk to protect against: the caller is
 * an authenticated administrator who is allowed to know who exists, and telling
 * them nothing would just produce a silent no-op.
 */
@CommandHandler(CreateUserCommand)
export class CreateUserHandler
  implements ICommandHandler<CreateUserCommand, CreateUserResult>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departments: DepartmentRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
    @Inject(TRANSACTION_RUNNER) private readonly transaction: TransactionRunner,
    private readonly userTypeAttribute: UserTypeAttributeWriter,
  ) {}

  async execute({ input }: CreateUserCommand): Promise<CreateUserResult> {
    if (input.userType === UserType.APPLICANT)
      throw new InvariantViolationError(
        'Applicants register themselves; they are not created by an administrator.',
      )

    const email = Email.create(input.email)
    const number = InstitutionalNumber.create(input.institutionalNumber)

    if (await this.users.findByEmail(email))
      throw new EmailAlreadyInUseError(input.email)
    if (await this.users.findByInstitutionalNumber(number))
      throw new InstitutionalNumberAlreadyInUseError(input.institutionalNumber)

    let departmentId: Identifier | undefined
    if (input.departmentId) {
      const department = await this.departments.findById(
        Identifier.of(input.departmentId),
      )
      if (!department)
        throw new EntityNotFoundError('Department', input.departmentId)
      departmentId = department.id
    }

    if (input.roleId) {
      const role = await this.roles.findById(Identifier.of(input.roleId))
      if (!role) throw new EntityNotFoundError('Role', input.roleId)
    }

    const user = User.create(this.ids.next(), {
      type: input.userType as UserType,
      name: PersonName.create(input.fullNameAr, input.fullNameEn),
      email,
      phone: input.phone,
      institutionalNumber: number,
      passwordHash: await this.hasher.hash(input.password),
      authProvider: 'LOCAL',
      departmentId,
      preferredLang: input.preferredLang ?? 'ar',
      status: UserStatus.ACTIVE,
    })

    // The account and its first role commit together. An employee created
    // without the role they were meant to get is an access-request ticket
    // nobody expects; better that the whole call fails and is retried.
    await this.transaction.run(async () => {
      await this.users.save(user)
      // ABAC reads user_type from user_attributes, not from the column. Writing
      // it here is what makes template eligibility work for this account at
      // all; leaving it out would deny them every template that names it.
      await this.userTypeAttribute.write(user.id, user.type)
      if (input.roleId)
        await this.roles.assignToUser({
          userId: user.id,
          roleId: Identifier.of(input.roleId),
          assignedBy: Identifier.of(input.createdBy),
        })
    })

    return { id: user.id.toString(), institutionalNumber: number.value }
  }
}
