import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { User } from '../../../../domain/identity/user'
import {
  ApplicantPurpose,
  UserStatus,
  UserType,
} from '../../../../domain/identity/enums'
import { Email } from '../../../../domain/identity/value-objects/email'
import { InstitutionalNumber } from '../../../../domain/identity/value-objects/institutional-number'
import { PersonName } from '../../../../domain/identity/value-objects/person-name'
import type { UserRepository } from '../../../../domain/identity/ports/user.repository'
import type { PasswordHasher } from '../../../../domain/identity/ports/password-hasher'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import { Identifier } from '../../../../domain/shared/identifier'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import {
  ID_GENERATOR,
  PASSWORD_HASHER,
  USER_REPOSITORY,
} from '../../../tokens'
import { EmailAlreadyInUseError } from '../../../errors'
import { RegisterUserCommand } from './register-user.command'

export interface RegisterUserResult {
  id: string
  email: string
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand, RegisterUserResult>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async execute({ input }: RegisterUserCommand): Promise<RegisterUserResult> {
    const email = Email.create(input.email)
    if (await this.users.findByEmail(email)) {
      throw new EmailAlreadyInUseError(email.value)
    }

    const name = PersonName.create(input.fullNameAr, input.fullNameEn)
    const institutionalNumber = input.institutionalNumber
      ? InstitutionalNumber.create(input.institutionalNumber)
      : undefined

    let passwordHash: string | undefined
    if (input.authProvider === 'LOCAL') {
      if (!input.password) {
        throw new InvariantViolationError('LOCAL auth requires a password.')
      }
      passwordHash = await this.hasher.hash(input.password)
    }

    const user = User.create(this.ids.next(), {
      type: input.type as UserType,
      name,
      email,
      phone: input.phone,
      institutionalNumber,
      passwordHash,
      authProvider: input.authProvider,
      applicantPurpose: input.applicantPurpose as ApplicantPurpose | undefined,
      departmentId: input.departmentId
        ? Identifier.of(input.departmentId)
        : undefined,
      preferredLang: input.preferredLang ?? 'ar',
      status: UserStatus.ACTIVE,
    })

    await this.users.save(user)
    return { id: user.id.toString(), email: email.value }
  }
}
