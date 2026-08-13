"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const cqrs_1 = require("@nestjs/cqrs");
const register_user_handler_1 = require("../../application/identity/commands/register-user/register-user.handler");
const authenticate_user_handler_1 = require("../../application/identity/commands/authenticate-user/authenticate-user.handler");
const assign_role_to_user_handler_1 = require("../../application/identity/commands/assign-role-to-user/assign-role-to-user.handler");
const revoke_role_from_user_handler_1 = require("../../application/identity/commands/revoke-role-from-user/revoke-role-from-user.handler");
const create_role_handler_1 = require("../../application/identity/commands/create-role/create-role.handler");
const update_role_handler_1 = require("../../application/identity/commands/update-role/update-role.handler");
const delete_role_handler_1 = require("../../application/identity/commands/delete-role/delete-role.handler");
const grant_permission_to_role_handler_1 = require("../../application/identity/commands/grant-permission-to-role/grant-permission-to-role.handler");
const revoke_permission_from_role_handler_1 = require("../../application/identity/commands/revoke-permission-from-role/revoke-permission-from-role.handler");
const administrative_floor_policy_1 = require("../../application/identity/policies/administrative-floor.policy");
const create_user_handler_1 = require("../../application/identity/commands/create-user/create-user.handler");
const sync_users_handler_1 = require("../../application/identity/commands/sync-users/sync-users.handler");
const sync_users_from_directory_1 = require("../../application/identity/sync-users-from-directory");
const user_type_attribute_writer_1 = require("../../application/identity/services/user-type-attribute.writer");
const set_user_attribute_handler_1 = require("../../application/identity/commands/set-user-attribute/set-user-attribute.handler");
const clear_user_attribute_handler_1 = require("../../application/identity/commands/clear-user-attribute/clear-user-attribute.handler");
const tokens_1 = require("../../application/tokens");
const prisma_user_repository_1 = require("../../infrastructure/identity/prisma-user.repository");
const directory_auth_provider_1 = require("../../infrastructure/identity/directory-auth.provider");
const prisma_user_query_1 = require("../../infrastructure/identity/prisma-user-query");
const prisma_role_repository_1 = require("../../infrastructure/identity/prisma-role.repository");
const prisma_role_query_1 = require("../../infrastructure/identity/prisma-role-query");
const prisma_attribute_definition_repository_1 = require("../../infrastructure/catalog/prisma-attribute-definition.repository");
const prisma_user_attribute_repository_1 = require("../../infrastructure/identity/prisma-user-attribute.repository");
const prisma_delegation_repository_1 = require("../../infrastructure/identity/prisma-delegation.repository");
const bcrypt_password_hasher_1 = require("../../infrastructure/identity/bcrypt-password-hasher");
const local_auth_provider_1 = require("../../infrastructure/identity/local-auth.provider");
const auth_provider_registry_1 = require("../../infrastructure/identity/auth-provider.registry");
const uuid_v7_id_generator_1 = require("../../infrastructure/shared/uuid-v7-id.generator");
const jwt_access_token_service_1 = require("../../infrastructure/identity/jwt-access-token.service");
const auth_controller_1 = require("./auth.controller");
const users_controller_1 = require("./users.controller");
const roles_controller_1 = require("./roles.controller");
const organization_module_1 = require("../organization/organization.module");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const permissions_guard_1 = require("./permissions.guard");
const working_hours_guard_1 = require("./working-hours.guard");
const get_effective_permissions_handler_1 = require("../../application/identity/queries/get-effective-permissions/get-effective-permissions.handler");
const grant_delegation_handler_1 = require("../../application/identity/commands/grant-delegation/grant-delegation.handler");
const revoke_delegation_handler_1 = require("../../application/identity/commands/revoke-delegation/revoke-delegation.handler");
const list_delegations_handler_1 = require("../../application/identity/queries/list-delegations/list-delegations.handler");
const get_delegation_handler_1 = require("../../application/identity/queries/get-delegation/get-delegation.handler");
const prisma_delegation_query_1 = require("../../infrastructure/identity/prisma-delegation-query");
const delegations_controller_1 = require("./delegations.controller");
const observability_module_1 = require("../observability/observability.module");
let IdentityModule = class IdentityModule {
};
exports.IdentityModule = IdentityModule;
exports.IdentityModule = IdentityModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule, organization_module_1.OrganizationModule, observability_module_1.ObservabilityModule],
        controllers: [
            auth_controller_1.AuthController,
            users_controller_1.UsersController,
            roles_controller_1.RolesController,
            delegations_controller_1.DelegationsController,
        ],
        providers: [
            register_user_handler_1.RegisterUserHandler,
            create_user_handler_1.CreateUserHandler,
            sync_users_handler_1.SyncUsersHandler,
            authenticate_user_handler_1.AuthenticateUserHandler,
            get_effective_permissions_handler_1.GetEffectivePermissionsHandler,
            assign_role_to_user_handler_1.AssignRoleToUserHandler,
            revoke_role_from_user_handler_1.RevokeRoleFromUserHandler,
            create_role_handler_1.CreateRoleHandler,
            update_role_handler_1.UpdateRoleHandler,
            delete_role_handler_1.DeleteRoleHandler,
            grant_permission_to_role_handler_1.GrantPermissionToRoleHandler,
            revoke_permission_from_role_handler_1.RevokePermissionFromRoleHandler,
            administrative_floor_policy_1.AdministrativeFloorPolicy,
            user_type_attribute_writer_1.UserTypeAttributeWriter,
            set_user_attribute_handler_1.SetUserAttributeHandler,
            clear_user_attribute_handler_1.ClearUserAttributeHandler,
            grant_delegation_handler_1.GrantDelegationHandler,
            revoke_delegation_handler_1.RevokeDelegationHandler,
            list_delegations_handler_1.ListDelegationsHandler,
            get_delegation_handler_1.GetDelegationHandler,
            permissions_guard_1.PermissionsGuard,
            working_hours_guard_1.WorkingHoursGuard,
            { provide: tokens_1.ACCESS_TOKEN_SERVICE, useClass: jwt_access_token_service_1.JwtAccessTokenService },
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: permissions_guard_1.PermissionsGuard },
            { provide: core_1.APP_GUARD, useClass: working_hours_guard_1.WorkingHoursGuard },
            { provide: tokens_1.USER_REPOSITORY, useClass: prisma_user_repository_1.PrismaUserRepository },
            { provide: tokens_1.USER_QUERY, useClass: prisma_user_query_1.PrismaUserQuery },
            { provide: tokens_1.ROLE_REPOSITORY, useClass: prisma_role_repository_1.PrismaRoleRepository },
            { provide: tokens_1.ROLE_QUERY, useClass: prisma_role_query_1.PrismaRoleQuery },
            {
                provide: tokens_1.ATTRIBUTE_DEFINITION_REPOSITORY,
                useClass: prisma_attribute_definition_repository_1.PrismaAttributeDefinitionRepository,
            },
            {
                provide: tokens_1.USER_ATTRIBUTE_REPOSITORY,
                useClass: prisma_user_attribute_repository_1.PrismaUserAttributeRepository,
            },
            { provide: tokens_1.DELEGATION_REPOSITORY, useClass: prisma_delegation_repository_1.PrismaDelegationRepository },
            { provide: tokens_1.DELEGATION_QUERY, useClass: prisma_delegation_query_1.PrismaDelegationQuery },
            { provide: tokens_1.PASSWORD_HASHER, useClass: bcrypt_password_hasher_1.BcryptPasswordHasher },
            { provide: tokens_1.ID_GENERATOR, useClass: uuid_v7_id_generator_1.UuidV7IdGenerator },
            {
                provide: sync_users_from_directory_1.SyncUsersFromDirectory,
                useFactory: (directory, users, departments, ids, transaction, userTypeAttribute) => new sync_users_from_directory_1.SyncUsersFromDirectory(directory, users, departments, ids, transaction, userTypeAttribute),
                inject: [
                    tokens_1.PERSONNEL_DIRECTORY,
                    tokens_1.USER_REPOSITORY,
                    tokens_1.DEPARTMENT_REPOSITORY,
                    tokens_1.ID_GENERATOR,
                    tokens_1.TRANSACTION_RUNNER,
                    user_type_attribute_writer_1.UserTypeAttributeWriter,
                ],
            },
            local_auth_provider_1.LocalAuthProvider,
            directory_auth_provider_1.DirectoryAuthProvider,
            {
                provide: tokens_1.AUTH_PROVIDER_REGISTRY,
                useFactory: (local, directory) => new auth_provider_registry_1.AuthProviderRegistryImpl([local, directory]),
                inject: [local_auth_provider_1.LocalAuthProvider, directory_auth_provider_1.DirectoryAuthProvider],
            },
        ],
    })
], IdentityModule);
//# sourceMappingURL=identity.module.js.map