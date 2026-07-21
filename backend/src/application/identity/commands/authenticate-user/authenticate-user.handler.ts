import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AuthenticatedUser } from '../../../../domain/identity/user'
import type { AuthProviderRegistry } from '../../../../domain/identity/ports/auth-provider-registry'
import { AUTH_PROVIDER_REGISTRY } from '../../../tokens'
import { AuthenticateUserCommand } from './authenticate-user.command'

/**
 * Delegates to whichever AuthProvider is registered for `method`. The use case
 * itself is auth-method agnostic — LDAP/OTP just register new providers.
 */
@CommandHandler(AuthenticateUserCommand)
export class AuthenticateUserHandler
  implements ICommandHandler<AuthenticateUserCommand, AuthenticatedUser>
{
  constructor(
    @Inject(AUTH_PROVIDER_REGISTRY)
    private readonly registry: AuthProviderRegistry,
  ) {}

  async execute(command: AuthenticateUserCommand): Promise<AuthenticatedUser> {
    const provider = this.registry.get(command.method)
    return provider.authenticate(command.credentials)
  }
}
