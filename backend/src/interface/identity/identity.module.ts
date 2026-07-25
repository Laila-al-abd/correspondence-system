import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { CqrsModule } from '@nestjs/cqrs'
import { RegisterUserHandler } from '../../application/identity/commands/register-user/register-user.handler'
import { AuthenticateUserHandler } from '../../application/identity/commands/authenticate-user/authenticate-user.handler'
import { AssignRoleToUserHandler } from '../../application/identity/commands/assign-role-to-user/assign-role-to-user.handler'
import { RevokeRoleFromUserHandler } from '../../application/identity/commands/revoke-role-from-user/revoke-role-from-user.handler'
import { SetUserAttributeHandler } from '../../application/identity/commands/set-user-attribute/set-user-attribute.handler'
import { ClearUserAttributeHandler } from '../../application/identity/commands/clear-user-attribute/clear-user-attribute.handler'
import {
  ACCESS_TOKEN_SERVICE,
  ATTRIBUTE_DEFINITION_REPOSITORY,
  AUTH_PROVIDER_REGISTRY,
  DELEGATION_REPOSITORY,
  ID_GENERATOR,
  PASSWORD_HASHER,
  ROLE_REPOSITORY,
  USER_ATTRIBUTE_REPOSITORY,
  USER_QUERY,
  USER_REPOSITORY,
} from '../../application/tokens'
import { PrismaUserRepository } from '../../infrastructure/identity/prisma-user.repository'
import { PrismaUserQuery } from '../../infrastructure/identity/prisma-user-query'
import { PrismaRoleRepository } from '../../infrastructure/identity/prisma-role.repository'
import { PrismaAttributeDefinitionRepository } from '../../infrastructure/catalog/prisma-attribute-definition.repository'
import { PrismaUserAttributeRepository } from '../../infrastructure/identity/prisma-user-attribute.repository'
import { PrismaDelegationRepository } from '../../infrastructure/identity/prisma-delegation.repository'
import { BcryptPasswordHasher } from '../../infrastructure/identity/bcrypt-password-hasher'
import { LocalAuthProvider } from '../../infrastructure/identity/local-auth.provider'
import { AuthProviderRegistryImpl } from '../../infrastructure/identity/auth-provider.registry'
import { IncrementingIdGenerator } from '../../infrastructure/shared/incrementing-id.generator'
import { JwtAccessTokenService } from '../../infrastructure/identity/jwt-access-token.service'
import { AuthController } from './auth.controller'
import { UsersController } from './users.controller'
import { OrganizationModule } from '../organization/organization.module'
import { JwtAuthGuard } from './jwt-auth.guard'
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
  imports: [CqrsModule, OrganizationModule],
  controllers: [AuthController, UsersController],
  providers: [
    RegisterUserHandler,
    AuthenticateUserHandler,
    GetEffectivePermissionsHandler,
    AssignRoleToUserHandler,
    RevokeRoleFromUserHandler,
    SetUserAttributeHandler,
    ClearUserAttributeHandler,
    PermissionsGuard,
    { provide: ACCESS_TOKEN_SERVICE, useClass: JwtAccessTokenService },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: USER_QUERY, useClass: PrismaUserQuery },
    { provide: ROLE_REPOSITORY, useClass: PrismaRoleRepository },
    {
      provide: ATTRIBUTE_DEFINITION_REPOSITORY,
      useClass: PrismaAttributeDefinitionRepository,
    },
    {
      provide: USER_ATTRIBUTE_REPOSITORY,
      useClass: PrismaUserAttributeRepository,
    },
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
