import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { AuthProviderRegistry } from '../../../../domain/identity/ports/auth-provider-registry'
import type { AccessTokenService } from '../../../../domain/identity/ports/access-token.service'
import { ACCESS_TOKEN_SERVICE, AUTH_PROVIDER_REGISTRY } from '../../../tokens'
import { AuthenticateUserCommand } from './authenticate-user.command'

/**
 * The result of a successful login: a signed access token the client sends back
 * as `Authorization: Bearer <token>`, plus the minimal user identity. Roles and
 * permissions are intentionally NOT included -- they are resolved per request.
 */
export interface AuthenticationResult {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: { id: string; email: string }
}

/**
 * Delegates to whichever AuthProvider is registered for `method`. The use case
 * itself is auth-method agnostic — LDAP/OTP just register new providers.
 */
@CommandHandler(AuthenticateUserCommand)
export class AuthenticateUserHandler
  implements ICommandHandler<AuthenticateUserCommand, AuthenticationResult>
{
  constructor(
    @Inject(AUTH_PROVIDER_REGISTRY)
    private readonly registry: AuthProviderRegistry,
    @Inject(ACCESS_TOKEN_SERVICE)
    private readonly tokens: AccessTokenService,
  ) {}

  async execute(
    command: AuthenticateUserCommand,
  ): Promise<AuthenticationResult> {
    const provider = this.registry.get(command.method)
    const user = await provider.authenticate(command.credentials)
    const issued = this.tokens.issue({ userId: user.id, email: user.email })
    return {
      accessToken: issued.accessToken,
      tokenType: issued.tokenType,
      expiresIn: issued.expiresIn,
      user: { id: user.id, email: user.email },
    }
  }
}
