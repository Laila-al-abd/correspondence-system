import { Inject, Logger } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { User } from '../../../../domain/identity/user'
import {
  ApplicantPurpose,
  UserStatus,
  UserType,
} from '../../../../domain/identity/enums'
import { Email } from '../../../../domain/identity/value-objects/email'
import { PersonName } from '../../../../domain/identity/value-objects/person-name'
import type { UserRepository } from '../../../../domain/identity/ports/user.repository'
import type { PasswordHasher } from '../../../../domain/identity/ports/password-hasher'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import {
  ID_GENERATOR,
  PASSWORD_HASHER,
  USER_REPOSITORY,
} from '../../../tokens'
import { RegisterUserCommand } from './register-user.command'

/**
 * Deliberately says nothing about the account. See the handler comment on
 * enumeration below.
 */
export interface RegisterUserResult {
  accepted: true
}

/**
 * Creates an external applicant account.
 *
 * Everything that carries privilege is fixed here rather than taken from the
 * request body: the account is always an APPLICANT, always LOCAL (email +
 * password), always without an institutional number or department. That is
 * what stops an anonymous caller from registering themselves as staff and
 * then being routed work.
 */
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand, RegisterUserResult>
{
  private readonly logger = new Logger(RegisterUserHandler.name)

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async execute({ input }: RegisterUserCommand): Promise<RegisterUserResult> {
    const email = Email.create(input.email)

    // Account enumeration: returning 409 "email already in use" to an
    // anonymous caller confirms which addresses are registered, which is
    // exactly what a credential-stuffing script wants. The response is the
    // same either way; the duplicate is only recorded in the server log.
    if (await this.users.findByEmail(email)) {
      this.logger.warn(
        `Registration attempt for an address that already exists: ${email.value}`,
      )
      return { accepted: true }
    }

    const name = PersonName.create(input.fullNameAr, input.fullNameEn)
    const passwordHash = await this.hasher.hash(input.password)

    const user = User.create(this.ids.next(), {
      type: UserType.APPLICANT,
      name,
      email,
      phone: input.phone,
      institutionalNumber: undefined,
      passwordHash,
      authProvider: 'LOCAL',
      applicantPurpose: input.applicantPurpose as ApplicantPurpose | undefined,
      departmentId: undefined,
      preferredLang: input.preferredLang ?? 'ar',
      status: UserStatus.ACTIVE,
    })

    await this.users.save(user)
    return { accepted: true }
  }
}
