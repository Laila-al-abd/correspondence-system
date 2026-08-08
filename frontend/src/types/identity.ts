/**
 * Frontend TypeScript types for the Identity module.
 * Synchronized with backend DTOs, command interfaces, and query views.
 * Generated from:
 * - backend/src/interface/identity/dto/*.dto.ts
 * - backend/src/application/identity/commands/**.command.ts
 * - backend/src/application/identity/queries/**.ts
 * - backend/src/application/identity/ports/*.port.ts
 * - backend/src/domain/identity/enums.ts
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * User types in the system.
 * Source: backend/src/domain/identity/enums.ts
 */
export enum UserType {
  APPLICANT = 'APPLICANT',
  STUDENT = 'STUDENT',
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
}

/**
 * User status values.
 * Source: backend/src/domain/identity/enums.ts
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

/**
 * Applicant purposes for self-registration.
 * Source: backend/src/domain/identity/enums.ts
 */
export enum ApplicantPurpose {
  STUDENT_ADMISSION = 'STUDENT_ADMISSION',
  GRADUATE_PROGRAM = 'GRADUATE_PROGRAM',
  JOB = 'JOB',
}

/**
 * Authentication methods.
 * Source: backend/src/domain/identity/enums.ts
 */
export type AuthMethod = string; // 'LOCAL' | 'OTP' | 'LDAP'

// ============================================================================
// DTO Types (matching backend DTOs)
// ============================================================================

/**
 * Request body for user login.
 * POST /auth/login
 * Matches: backend/src/interface/identity/dto/login.dto.ts
 */
export interface LoginDto {
  /** Auth method to use (optional, defaults to LOCAL) */
  method?: string;

  /** User email */
  email: string;

  /** User password */
  password: string;
}

/**
 * Request body for public user self-registration.
 * POST /auth/register
 * Matches: backend/src/interface/identity/dto/register-user.dto.ts
 */
export interface RegisterUserDto {
  /** Full Arabic name (required) */
  fullNameAr: string;

  /** Full English name (optional) */
  fullNameEn?: string;

  /** Email address */
  email: string;

  /** Phone number (optional) */
  phone?: string;

  /** Password (minimum 8 characters) */
  password: string;

  /** Applicant purpose (optional) */
  applicantPurpose?: ApplicantPurpose;

  /** Preferred language code (optional) */
  preferredLang?: string;
}

/**
 * Request body for administrator creating a user.
 * POST /users
 * Matches: backend/src/interface/identity/dto/create-user.dto.ts
 */
export interface CreateUserDto {
  /** User type (EMPLOYEE, STUDENT, ADMIN) */
  userType: UserType | string;

  /** Full Arabic name */
  fullNameAr: string;

  /** Full English name (optional) */
  fullNameEn?: string;

  /** Email address */
  email: string;

  /** Phone number (optional) */
  phone?: string;

  /** Institutional number (required for staff/students) */
  institutionalNumber: string;

  /** Temporary password (minimum 8 characters) */
  password: string;

  /** Department ID (optional, UUID) */
  departmentId?: string;

  /** Preferred language code (optional) */
  preferredLang?: string;

  /** Optional role ID to assign (optional, UUID) */
  roleId?: string;
}

/**
 * Request body for setting a user attribute.
 * PUT /users/:userId/attributes
 * Matches: backend/src/interface/identity/dto/set-user-attribute.dto.ts
 */
export interface SetUserAttributeDto {
  /** Attribute code */
  attributeCode: string;

  /** Attribute value (string, number, or boolean) */
  value: string | number | boolean;
}

/**
 * Request body for assigning a role to a user.
 * POST /users/:userId/roles
 * Matches: backend/src/interface/identity/dto/assign-role.dto.ts
 */
export interface AssignRoleDto {
  /** Role ID */
  roleId: string;

  /** Optional department scope (omit for global role) */
  departmentId?: string;

  /** Optional expiry date (ISO 8601) */
  expiresAt?: string;

  /** Optional reason for assignment */
  reason?: string;
}

/**
 * Localized text DTO for role operations.
 * Matches: backend/src/interface/identity/dto/create-role.dto.ts (LocalizedTextDto)
 */
export interface LocalizedTextDto {
  ar: string;
  en?: string;
}

/**
 * Request body for creating a role.
 * POST /roles
 * Matches: backend/src/interface/identity/dto/create-role.dto.ts
 */
export interface CreateRoleDto {
  name: LocalizedTextDto;
  description?: LocalizedTextDto;
  permissionCodes?: string[];
}

/**
 * Request body for granting a permission to a role.
 * POST /roles/:roleId/permissions
 * Matches: backend/src/interface/identity/dto/grant-permission.dto.ts
 */
export interface GrantPermissionDto {
  /** Permission code (e.g., "request.act") */
  code: string;
}

/**
 * Request body for updating a role.
 * PATCH /roles/:roleId
 * Matches: backend/src/interface/identity/dto/update-role.dto.ts
 */
export interface UpdateRoleDto {
  name: LocalizedTextDto;
  description?: LocalizedTextDto;
}

/**
 * Query parameters for listing users.
 * GET /users
 * Matches: backend/src/interface/identity/dto/list-users.dto.ts
 */
export interface ListUsersDto {
  search?: string;
  userType?: string;
  status?: UserStatus | string;
  departmentId?: string;
  limit?: string;
  offset?: string;
}

/**
 * Request body for granting a delegation.
 * POST /delegations
 * Matches: backend/src/interface/identity/dto/grant-delegation.dto.ts
 */
export interface GrantDelegationDto {
  delegatorId: string;
  delegateId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

// ============================================================================
// Command Input Types (matching backend command interfaces)
// ============================================================================

/**
 * Input for AuthenticateUserCommand.
 * Matches: backend/src/application/identity/commands/authenticate-user/authenticate-user.command.ts
 */
export interface AuthenticateUserInput {
  method: string;
  credentials: Record<string, unknown>;
}

/**
 * Input for RegisterUserCommand.
 * Matches: backend/src/application/identity/commands/register-user/register-user.command.ts
 */
export interface RegisterUserInput {
  fullNameAr: string;
  fullNameEn?: string;
  email: string;
  phone?: string;
  password: string;
  applicantPurpose?: string;
  preferredLang?: string;
}

/**
 * Input for CreateUserCommand.
 * Matches: backend/src/application/identity/commands/create-user/create-user.command.ts
 */
export interface CreateUserInput {
  userType: string;
  fullNameAr: string;
  fullNameEn?: string;
  email: string;
  phone?: string;
  institutionalNumber: string;
  password: string;
  departmentId?: string;
  preferredLang?: string;
  roleId?: string;
  createdBy: string;
}

/**
 * Input for SetUserAttributeCommand.
 * Matches: backend/src/application/identity/commands/set-user-attribute/set-user-attribute.command.ts
 */
export interface SetUserAttributeInput {
  userId: string;
  attributeCode: string;
  value: unknown;
}

/**
 * Input for ClearUserAttributeCommand.
 * Matches: backend/src/application/identity/commands/clear-user-attribute/clear-user-attribute.command.ts
 */
export interface ClearUserAttributeInput {
  userId: string;
  attributeCode: string;
}

/**
 * Input for AssignRoleToUserCommand.
 * Matches: backend/src/application/identity/commands/assign-role-to-user/assign-role-to-user.command.ts
 */
export interface AssignRoleToUserInput {
  userId: string;
  roleId: string;
  departmentId?: string;
  reason?: string;
  expiresAt?: string;
  assignedBy?: string;
}

/**
 * Input for RevokeRoleFromUserCommand.
 * Matches: backend/src/application/identity/commands/revoke-role-from-user/revoke-role-from-user.command.ts
 */
export interface RevokeRoleFromUserInput {
  userId: string;
  roleId: string;
  departmentId?: string;
}

/**
 * Localized text input for command operations.
 * Matches: backend/src/application/identity/commands/create-role/create-role.command.ts (LocalizedTextInput)
 */
export interface LocalizedTextInput {
  ar: string;
  en?: string;
}

/**
 * Input for CreateRoleCommand.
 * Matches: backend/src/application/identity/commands/create-role/create-role.command.ts
 */
export interface CreateRoleInput {
  name: LocalizedTextInput;
  description?: LocalizedTextInput;
  permissionCodes?: string[];
  createdBy?: string;
}

/**
 * Input for UpdateRoleCommand.
 * Matches: backend/src/application/identity/commands/update-role/update-role.command.ts
 */
export interface UpdateRoleInput {
  roleId: string;
  name: LocalizedTextInput;
  description?: LocalizedTextInput;
}

/**
 * Input for DeleteRoleCommand.
 * Matches: backend/src/application/identity/commands/delete-role/delete-role.command.ts
 */
export interface DeleteRoleInput {
  roleId: string;
}

/**
 * Input for GrantPermissionToRoleCommand.
 * Matches: backend/src/application/identity/commands/grant-permission-to-role/grant-permission-to-role.command.ts
 */
export interface GrantPermissionToRoleInput {
  roleId: string;
  permissionCode: string;
}

/**
 * Input for RevokePermissionFromRoleCommand.
 * Matches: backend/src/application/identity/commands/revoke-permission-from-role/revoke-permission-from-role.command.ts
 */
export interface RevokePermissionFromRoleInput {
  roleId: string;
  permissionCode: string;
}

/**
 * Input for GrantDelegationCommand.
 * Matches: backend/src/application/identity/commands/grant-delegation/grant-delegation.command.ts
 */
export interface GrantDelegationInput {
  delegatorId: string;
  delegateId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

/**
 * Input for RevokeDelegationCommand.
 * Matches: backend/src/application/identity/commands/revoke-delegation/revoke-delegation.command.ts
 */
export interface RevokeDelegationInput {
  delegationId: string;
}

/**
 * Input for SyncUsersCommand.
 * Matches: backend/src/application/identity/commands/sync-users/sync-users.command.ts
 */
export interface SyncUsersInput {
  source?: string;
}

// ============================================================================
// Query View Types (matching backend query views/ports)
// ============================================================================

/**
 * Localized name view.
 * Source: backend/src/application/identity/ports/delegation-query.port.ts (LocalizedName)
 */
export interface LocalizedNameView {
  ar: string;
  en?: string;
}

/**
 * Delegation view for list/detail responses.
 * Source: backend/src/application/identity/ports/delegation-query.port.ts (DelegationView)
 */
export interface DelegationView {
  id: string;
  delegatorId: string;
  delegatorName: LocalizedNameView;
  delegateId: string;
  delegateName: LocalizedNameView;
  startDate: string;
  endDate: string;
  isActive: boolean;
  reason: string | null;
  createdAt: string;
}

/**
 * User summary in list responses.
 * Source: backend/src/application/identity/ports/user-query.port.ts (UserSummaryView)
 */
export interface UserSummaryView {
  id: string;
  userType: string;
  fullNameAr: string;
  fullNameEn: string | null;
  email: string;
  phone: string | null;
  institutionalNumber: string | null;
  departmentId: string | null;
  status: string;
  authProvider: string;
  preferredLang: string;
  createdAt: string;
}

/**
 * User role view.
 * Source: backend/src/application/identity/ports/user-query.port.ts (UserRoleView)
 */
export interface UserRoleView {
  roleId: string;
  roleName: LocalizedTextView;
  departmentId: string | null;
  expiresAt: string | null;
  assignedAt: string;
}

/**
 * User attribute view.
 * Source: backend/src/application/identity/ports/user-query.port.ts (UserAttributeView)
 */
export interface UserAttributeView {
  attributeId: string;
  attributeCode: string;
  value: unknown;
}

/**
 * Detailed user view with roles and attributes.
 * Source: backend/src/application/identity/ports/user-query.port.ts (UserDetailView)
 */
export interface UserDetailView extends UserSummaryView {
  applicantPurpose: string | null;
  roles: UserRoleView[];
  attributes: UserAttributeView[];
}

/**
 * Filter for listing users.
 * Source: backend/src/application/identity/ports/user-query.port.ts (ListUsersFilter)
 */
export interface ListUsersFilter {
  search?: string;
  userType?: string;
  status?: string;
  departmentId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Paginated list of users result.
 * Source: backend/src/application/identity/ports/user-query.port.ts (ListUsersResult)
 */
export interface ListUsersResult {
  total: number;
  limit: number;
  offset: number;
  items: UserSummaryView[];
}

/**
 * Localized text view.
 * Source: backend/src/application/identity/ports/role-query.port.ts (LocalizedTextView)
 */
export interface LocalizedTextView {
  ar: string;
  en?: string;
}

/**
 * Permission view.
 * Source: backend/src/application/identity/ports/role-query.port.ts (PermissionView)
 */
export interface PermissionView {
  id: string;
  code: string;
  name: LocalizedTextView;
  description: LocalizedTextView | null;
}

/**
 * Permission group view.
 * Source: backend/src/application/identity/ports/role-query.port.ts (PermissionGroupView)
 */
export interface PermissionGroupView {
  id: string;
  name: LocalizedTextView;
  description: LocalizedTextView | null;
  permissions: PermissionView[];
}

/**
 * Role summary in list responses.
 * Source: backend/src/application/identity/ports/role-query.port.ts (RoleSummaryView)
 */
export interface RoleSummaryView {
  id: string;
  name: LocalizedTextView;
  description: LocalizedTextView | null;
  isSystem: boolean;
  permissionCount: number;
  assignmentCount: number;
  createdAt: string;
}

/**
 * Detailed role view with permissions.
 * Source: backend/src/application/identity/ports/role-query.port.ts (RoleDetailView)
 */
export interface RoleDetailView extends RoleSummaryView {
  permissions: PermissionView[];
}

// ============================================================================
// Response Types (for API responses)
// ============================================================================

/**
 * Login response with tokens.
 */
export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: {
    id: string;
    email: string;
  };
}

/**
 * Public registration response.
 * POST /auth/register
 * Always 202 with a fixed message — the actual account creation happens async.
 * Source: backend/src/interface/identity/auth.controller.ts (register method)
 */
export interface RegisterResponse {
  status: 'accepted';
  message: string;
}

/**
 * Paginated list response wrapper.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Role list response.
 */
export interface RoleListResponse extends PaginatedResponse<RoleSummaryView> {}

/**
 * Permission groups response.
 */
export interface PermissionGroupsResponse {
  groups: PermissionGroupView[];
}

/**
 * Effective permissions response for a user.
 * Source: backend/src/application/identity/queries/get-effective-permissions/get-effective-permissions.query.ts
 */
export interface EffectivePermissionsResponse {
  userId: string;
  permissions: string[];
}
/**
 * Response for creating a role.
 * POST /roles
 * Matches: CreateRoleHandler returns CreateRoleResult { roleId }
 * Source: backend/src/application/identity/commands/create-role/create-role.handler.ts
 */
export interface CreateRoleResponse {
  /** The created role ID */
  roleId: string;
}

/**
 * Response for creating a user.
 * POST /users
 * Matches: CreateUserHandler returns CreateUserResult { id, institutionalNumber }
 * Source: backend/src/application/identity/commands/create-user/create-user.handler.ts
 */
export interface CreatedUserResponse {
  /** The created user ID */
  id: string;
  /** The institutional number assigned */
  institutionalNumber: string;
}

/**
 * Response for sync users from directory.
 * POST /users/sync
 * Matches: SyncUsersFromDirectory.execute() returns SyncUsersResult
 * Source: backend/src/application/identity/sync-users-from-directory.ts
 */
export interface SyncUsersResponse {
  /** Source system name */
  source: string;
  /** New accounts created */
  created: number;
  /** Existing directory accounts refreshed */
  updated: number;
  /** Self-registered applicants promoted to staff */
  upgraded: number;
  /** Total records processed */
  total: number;
  /** Records deliberately not applied, each with reason */
  skipped: Array<{ institutionalNumber: string; reason: string }>;
  /** External department ids that no synced department matched */
  unresolvedDepartments: string[];
}

/**
 * Result of assigning a role to a user.
 * POST /users/:userId/roles
 * Matches: AssignRoleToUserHandler returns AssignRoleToUserResult
 * Source: backend/src/application/identity/commands/assign-role-to-user/assign-role-to-user.handler.ts
 */
export interface AssignRoleResult {
  userId: string;
  roleId: string;
  departmentId?: string;
}

/**
 * Result of setting a user attribute.
 * PUT /users/:userId/attributes
 * Matches: SetUserAttributeHandler returns SetUserAttributeResult
 * Source: backend/src/application/identity/commands/set-user-attribute/set-user-attribute.handler.ts
 */
export interface SetUserAttributeResult {
  userId: string;
  attributeCode: string;
  value: unknown;
}