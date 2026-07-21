import { Inject, Injectable } from '@nestjs/common'
import { AuthProvider } from '../../domain/identity/ports/auth-provider'
import type { UserRepository } from '../../domain/identity/ports/user.repository'
import type { PasswordHasher } from '../../domain/identity/ports/password-hasher'
import { AuthenticatedUser } from '../../domain/identity/user'
import { Email } from '../../domain/identity/value-objects/email'
import { UserStatus } from '../../domain/identity/enums'
import { PASSWORD_HASHER, USER_REPOSITORY } from '../../application/tokens'
import { InvalidCredentialsError } from '../../application/errors'

/**
 * Email + password authentication. Registered under the 'LOCAL' key. New auth
 * methods (LDAP, OTP) are new classes implementing AuthProvider — this one is
 * untouched.
 */
@Injectable()
export class LocalAuthProvider implements AuthProvider {
  readonly key = 'LOCAL'

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
  ) {}

  async authenticate(
    credentials: Record<string, unknown>,
  ): Promise<AuthenticatedUser> {
    const email = Email.create(String(credentials.email ?? ''))
    const user = await this.users.findByEmail(email)
    if (!user || !user.hasLocalPassword()) {
      throw new InvalidCredentialsError()
    }
    const ok = await this.hasher.compare(
      String(credentials.password ?? ''),
      user.passwordHash as string,
    )
    if (!ok || user.status !== UserStatus.ACTIVE) {
      throw new InvalidCredentialsError()
    }
    return user.toAuthenticated()
  }
}
