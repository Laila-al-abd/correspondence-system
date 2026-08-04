import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthProvider } from '../../domain/identity/ports/auth-provider'
import type { UserRepository } from '../../domain/identity/ports/user.repository'
import { AuthenticatedUser } from '../../domain/identity/user'
import { Email } from '../../domain/identity/value-objects/email'
import { UserStatus } from '../../domain/identity/enums'
import { USER_REPOSITORY } from '../../application/tokens'
import {
  InvalidCredentialsError,
  UnsupportedAuthMethodError,
} from '../../application/errors'

/**
 * The directory (LDAP) key that user rows created by the personnel sync carry.
 * It must match `DIRECTORY_AUTH_PROVIDER` in the sync service, or synced people
 * will name a provider the registry cannot resolve.
 */
export const DIRECTORY_PROVIDER_KEY = 'LDAP'

/** Env var holding the shared demo password. Absent means "refuse everyone". */
const DEMO_PASSWORD_KEY = 'DIRECTORY_DEMO_PASSWORD'

/**
 * Authenticates people whose account came from the personnel directory.
 *
 * **This is a stand-in for an LDAP bind, and it is not a security boundary.**
 * Accounts created by the sync have `auth_provider = 'LDAP'` and no password
 * hash -- correct, because their real password lives in the university's
 * directory and must never be copied here. But only LOCAL was ever registered,
 * so every synced account was unable to sign in at all: the row existed, the
 * roles existed, and no code path could authenticate it.
 *
 * What is real here is the seam. The registry resolves a provider by the key
 * stored on the account, the login use case is untouched, and replacing this
 * class with a genuine bind is a new file plus one line of wiring. What is fake
 * is only the credential check, which compares against one configured password
 * instead of asking a directory server.
 *
 * Two deliberate refusals keep the stub from becoming a hole:
 *
 * - With `DIRECTORY_DEMO_PASSWORD` unset it authenticates **nobody**. A
 *   deployment that forgets to configure it fails closed, and one that never
 *   sets it -- production -- cannot be signed into through this path at all.
 * - It refuses accounts whose `auth_provider` is not this one, so it can never
 *   become a second way into a LOCAL account and around its real password.
 */
@Injectable()
export class DirectoryAuthProvider implements AuthProvider {
  readonly key = DIRECTORY_PROVIDER_KEY
  private readonly logger = new Logger(DirectoryAuthProvider.name)

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly config: ConfigService,
  ) {}

  async authenticate(
    credentials: Record<string, unknown>,
  ): Promise<AuthenticatedUser> {
    const shared = this.config.get<string>(DEMO_PASSWORD_KEY)
    if (!shared) {
      this.logger.warn(
        `A directory sign-in was attempted but ${DEMO_PASSWORD_KEY} is not set; refusing.`,
      )
      throw new UnsupportedAuthMethodError(this.key)
    }

    const email = Email.create(String(credentials.email ?? ''))
    const user = await this.users.findByEmail(email)
    // One error for every failure below, so the response cannot be used to
    // learn which addresses exist.
    if (!user) throw new InvalidCredentialsError()
    if (user.authProvider !== this.key) throw new InvalidCredentialsError()
    if (user.status !== UserStatus.ACTIVE) throw new InvalidCredentialsError()
    if (String(credentials.password ?? '') !== shared)
      throw new InvalidCredentialsError()

    return user.toAuthenticated()
  }
}
