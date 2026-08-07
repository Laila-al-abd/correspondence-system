import { Module } from '@nestjs/common'
import type { UserRepository } from '../../domain/identity/ports/user.repository'
import type {
  DepartmentRepository,
  PersonnelDirectory,
} from '../../domain/organization/ports/department.repository'
import type { IdGenerator } from '../../domain/shared/id-generator'
import type { TransactionRunner } from '../../domain/shared/transaction-runner'
import { APP_GUARD } from '@nestjs/core'
import { CqrsModule } from '@nestjs/cqrs'
import { RegisterUserHandler } from '../../application/identity/commands/register-user/register-user.handler'
import { AuthenticateUserHandler } from '../../application/identity/commands/authenticate-user/authenticate-user.handler'
import { AssignRoleToUserHandler } from '../../application/identity/commands/assign-role-to-user/assign-role-to-user.handler'
import { RevokeRoleFromUserHandler } from '../../application/identity/commands/revoke-role-from-user/revoke-role-from-user.handler'
import { CreateRoleHandler } from '../../application/identity/commands/create-role/create-role.handler'
import { UpdateRoleHandler } from '../../application/identity/commands/update-role/update-role.handler'
import { DeleteRoleHandler } from '../../application/identity/commands/delete-role/delete-role.handler'
import { GrantPermissionToRoleHandler } from '../../application/identity/commands/grant-permission-to-role/grant-permission-to-role.handler'
import { RevokePermissionFromRoleHandler } from '../../application/identity/commands/revoke-permission-from-role/revoke-permission-from-role.handler'
import { AdministrativeFloorPolicy } from '../../application/identity/policies/administrative-floor.policy'
import { CreateUserHandler } from '../../application/identity/commands/create-user/create-user.handler'
import { SyncUsersHandler } from '../../application/identity/commands/sync-users/sync-users.handler'
import { SyncUsersFromDirectory } from '../../application/identity/sync-users-from-directory'
import { UserTypeAttributeWriter } from '../../application/identity/services/user-type-attribute.writer'
import { SetUserAttributeHandler } from '../../application/identity/commands/set-user-attribute/set-user-attribute.handler'
import { ClearUserAttributeHandler } from '../../application/identity/commands/clear-user-attribute/clear-user-attribute.handler'
import {
  ACCESS_TOKEN_SERVICE,
  ATTRIBUTE_DEFINITION_REPOSITORY,
  AUTH_PROVIDER_REGISTRY,
  DEPARTMENT_REPOSITORY,
  PERSONNEL_DIRECTORY,
  TRANSACTION_RUNNER,
  DELEGATION_QUERY,
  DELEGATION_REPOSITORY,
  ID_GENERATOR,
  PASSWORD_HASHER,
  ROLE_QUERY,
  ROLE_REPOSITORY,
  USER_ATTRIBUTE_REPOSITORY,
  USER_QUERY,
  USER_REPOSITORY,
} from '../../application/tokens'
import { PrismaUserRepository } from '../../infrastructure/identity/prisma-user.repository'
import { DirectoryAuthProvider } from '../../infrastructure/identity/directory-auth.provider'
import { PrismaUserQuery } from '../../infrastructure/identity/prisma-user-query'
import { PrismaRoleRepository } from '../../infrastructure/identity/prisma-role.repository'
import { PrismaRoleQuery } from '../../infrastructure/identity/prisma-role-query'
import { PrismaAttributeDefinitionRepository } from '../../infrastructure/catalog/prisma-attribute-definition.repository'
import { PrismaUserAttributeRepository } from '../../infrastructure/identity/prisma-user-attribute.repository'
import { PrismaDelegationRepository } from '../../infrastructure/identity/prisma-delegation.repository'
import { BcryptPasswordHasher } from '../../infrastructure/identity/bcrypt-password-hasher'
import { LocalAuthProvider } from '../../infrastructure/identity/local-auth.provider'
import { AuthProviderRegistryImpl } from '../../infrastructure/identity/auth-provider.registry'
import { UuidV7IdGenerator } from '../../infrastructure/shared/uuid-v7-id.generator'
import { JwtAccessTokenService } from '../../infrastructure/identity/jwt-access-token.service'
import { AuthController } from './auth.controller'
import { UsersController } from './users.controller'
import { RolesController } from './roles.controller'
import { OrganizationModule } from '../organization/organization.module'
import { JwtAuthGuard } from './jwt-auth.guard'
import { PermissionsGuard } from './permissions.guard'
import { WorkingHoursGuard } from './working-hours.guard'
import { GetEffectivePermissionsHandler } from '../../application/identity/queries/get-effective-permissions/get-effective-permissions.handler'
import { GrantDelegationHandler } from '../../application/identity/commands/grant-delegation/grant-delegation.handler'
import { RevokeDelegationHandler } from '../../application/identity/commands/revoke-delegation/revoke-delegation.handler'
import { ListDelegationsHandler } from '../../application/identity/queries/list-delegations/list-delegations.handler'
import { GetDelegationHandler } from '../../application/identity/queries/get-delegation/get-delegation.handler'
import { PrismaDelegationQuery } from '../../infrastructure/identity/prisma-delegation-query'
import { DelegationsController } from './delegations.controller'
import { ObservabilityModule } from '../observability/observability.module'

/**
 * Identity composition root. Binds every domain port to an adapter.
 *
 * USER_REPOSITORY, ROLE_REPOSITORY, and DELEGATION_REPOSITORY are Prisma-backed.
 * Requires the Prisma client to be regenerated from the full schema
 * (`npx prisma generate`) and the tables migrated before it will run. The
 * in-memory user repository is kept for unit tests.
 */
@Module({
  imports: [CqrsModule, OrganizationModule, ObservabilityModule],
  controllers: [
    AuthController,
    UsersController,
    RolesController,
    DelegationsController,
  ],
  providers: [
    RegisterUserHandler,
    CreateUserHandler,
    SyncUsersHandler,
    AuthenticateUserHandler,
    GetEffectivePermissionsHandler,
    AssignRoleToUserHandler,
    RevokeRoleFromUserHandler,
    CreateRoleHandler,
    UpdateRoleHandler,
    DeleteRoleHandler,
    GrantPermissionToRoleHandler,
    RevokePermissionFromRoleHandler,
    AdministrativeFloorPolicy,
    UserTypeAttributeWriter,
    SetUserAttributeHandler,
    ClearUserAttributeHandler,
    GrantDelegationHandler,
    RevokeDelegationHandler,
    ListDelegationsHandler,
    GetDelegationHandler,
    PermissionsGuard,
    WorkingHoursGuard,
    { provide: ACCESS_TOKEN_SERVICE, useClass: JwtAccessTokenService },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    // Runs last: permission failures should be reported before opening hours.
    { provide: APP_GUARD, useClass: WorkingHoursGuard },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: USER_QUERY, useClass: PrismaUserQuery },
    { provide: ROLE_REPOSITORY, useClass: PrismaRoleRepository },
    { provide: ROLE_QUERY, useClass: PrismaRoleQuery },
    {
      provide: ATTRIBUTE_DEFINITION_REPOSITORY,
      useClass: PrismaAttributeDefinitionRepository,
    },
    {
      provide: USER_ATTRIBUTE_REPOSITORY,
      useClass: PrismaUserAttributeRepository,
    },
    { provide: DELEGATION_REPOSITORY, useClass: PrismaDelegationRepository },
    { provide: DELEGATION_QUERY, useClass: PrismaDelegationQuery },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: ID_GENERATOR, useClass: UuidV7IdGenerator },
    {
      provide: SyncUsersFromDirectory,
      useFactory: (
        directory: PersonnelDirectory,
        users: UserRepository,
        departments: DepartmentRepository,
        ids: IdGenerator,
        transaction: TransactionRunner,
        userTypeAttribute: UserTypeAttributeWriter,
      ) =>
        new SyncUsersFromDirectory(
          directory,
          users,
          departments,
          ids,
          transaction,
          userTypeAttribute,
        ),
      inject: [
        PERSONNEL_DIRECTORY,
        USER_REPOSITORY,
        DEPARTMENT_REPOSITORY,
        ID_GENERATOR,
        TRANSACTION_RUNNER,
        UserTypeAttributeWriter,
      ],
    },
    LocalAuthProvider,
    DirectoryAuthProvider,
    {
      provide: AUTH_PROVIDER_REGISTRY,
      useFactory: (
        local: LocalAuthProvider,
        directory: DirectoryAuthProvider,
      ) => new AuthProviderRegistryImpl([local, directory]),
      inject: [LocalAuthProvider, DirectoryAuthProvider],
    },
  ],
})
export class IdentityModule {}
