import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { RegisterUserHandler } from '../../application/identity/commands/register-user/register-user.handler'
import { AuthenticateUserHandler } from '../../application/identity/commands/authenticate-user/authenticate-user.handler'
import {
  AUTH_PROVIDER_REGISTRY,
  DELEGATION_REPOSITORY,
  ID_GENERATOR,
  PASSWORD_HASHER,
  ROLE_REPOSITORY,
  USER_REPOSITORY,
} from '../../application/tokens'
import { PrismaUserRepository } from '../../infrastructure/identity/prisma-user.repository'
import { PrismaRoleRepository } from '../../infrastructure/identity/prisma-role.repository'
import { PrismaDelegationRepository } from '../../infrastructure/identity/prisma-delegation.repository'
import { BcryptPasswordHasher } from '../../infrastructure/identity/bcrypt-password-hasher'
import { LocalAuthProvider } from '../../infrastructure/identity/local-auth.provider'
import { AuthProviderRegistryImpl } from '../../infrastructure/identity/auth-provider.registry'
import { IncrementingIdGenerator } from '../../infrastructure/shared/incrementing-id.generator'
import { AuthController } from './auth.controller'
import { PermissionsGuard } from './permissions.guard'
import { GetEffectivePermissionsHandler } from '../../application/identity/queries/get-effective-permissions/get-effective-permissions.handler'

/**
 * Identity composition root. Binds every domain port to an adapter.
 *
 * USER_REPOSITORY, ROLE_REPOSITORY, and DELEGATION_REPOSITORY are Prisma-backed.
 * Requires the Prisma client to be regenerated from the full schema
 * (`npx prisma generate`) and the tables migrated before it will run. The
 * in-memory user repository is kept for unit tests.
 */
@Module({
  imports: [CqrsModule],
  controllers: [AuthController],
  providers: [
    RegisterUserHandler,
    AuthenticateUserHandler,
    GetEffectivePermissionsHandler,
    PermissionsGuard,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: ROLE_REPOSITORY, useClass: PrismaRoleRepository },
    { provide: DELEGATION_REPOSITORY, useClass: PrismaDelegationRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: ID_GENERATOR, useClass: IncrementingIdGenerator },
    LocalAuthProvider,
    {
      provide: AUTH_PROVIDER_REGISTRY,
      useFactory: (local: LocalAuthProvider) =>
        new AuthProviderRegistryImpl([local]),
      inject: [LocalAuthProvider],
    },
  ],
})
export class IdentityModule {}
