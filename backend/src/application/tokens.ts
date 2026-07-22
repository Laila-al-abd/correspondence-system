/**
 * Dependency-injection tokens that bind domain ports (interfaces) to their
 * infrastructure adapters. Interfaces cannot be used as Nest injection tokens,
 * so each port gets a symbol here.
 */

// shared
export const ID_GENERATOR = Symbol('IdGenerator')

// identity
export const USER_REPOSITORY = Symbol('UserRepository')
export const PASSWORD_HASHER = Symbol('PasswordHasher')
export const AUTH_PROVIDER_REGISTRY = Symbol('AuthProviderRegistry')
export const ROLE_REPOSITORY = Symbol('RoleRepository')
export const DELEGATION_REPOSITORY = Symbol('DelegationRepository')

// catalog
export const LANGUAGE_REPOSITORY = Symbol('LanguageRepository')
export const TEMPLATE_REPOSITORY = Symbol('TemplateRepository')
export const SENSITIVITY_LEVEL_REPOSITORY = Symbol('SensitivityLevelRepository')
export const REQUEST_CATEGORY_REPOSITORY = Symbol('RequestCategoryRepository')
export const ACTION_TYPE_REPOSITORY = Symbol('ActionTypeRepository')

// organization
export const DEPARTMENT_REPOSITORY = Symbol('DepartmentRepository')
export const ORG_UNIT_TYPE_REPOSITORY = Symbol('OrgUnitTypeRepository')
export const PERSONNEL_DIRECTORY = Symbol('PersonnelDirectory')

// workflow
export const WORKFLOW_PATH_REPOSITORY = Symbol('WorkflowPathRepository')

// request
export const REQUEST_REPOSITORY = Symbol('RequestRepository')
export const REQUEST_ACTION_REPOSITORY = Symbol('RequestActionRepository')
export const PAYMENT_REPOSITORY = Symbol('PaymentRepository')
export const DOCUMENT_REPOSITORY = Symbol('DocumentRepository')

// storage
export const OBJECT_STORAGE = Symbol('ObjectStorage')
