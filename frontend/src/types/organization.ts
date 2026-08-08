/**
 * Frontend TypeScript types for the Organization module.
 * Synchronized with backend DTOs, command interfaces, and query views.
 * Generated from:
 * - backend/src/interface/organization/dto/*.dto.ts
 * - backend/src/application/organization/commands/**.command.ts
 * - backend/src/application/organization/ports/*.port.ts
 */

// ============================================================================
// DTO Types (matching backend DTOs)
// ============================================================================

/**
 * Request body for syncing departments from external directory.
 * POST /organization/departments/sync
 * Matches: backend/src/interface/organization/dto/sync-departments.dto.ts
 */
export interface SyncDepartmentsDto {
  /** Optional override of the source-system label recorded on synced units */
  source?: string;
}

/**
 * Localized text DTO for department operations.
 * Matches: backend/src/interface/organization/dto/create-department.dto.ts (LocalizedTextDto)
 */
export interface LocalizedTextDto {
  ar: string;
  en?: string;
}

/**
 * Request body for manually creating a department.
 * POST /organization/departments
 * Matches: backend/src/interface/organization/dto/create-department.dto.ts
 */
export interface CreateDepartmentDto {
  /** Org-unit type code: UNIVERSITY | FACULTY | DEPARTMENT | UNIT | OFFICE */
  unitTypeCode: string;

  /** Department name */
  name: LocalizedTextDto;

  /** Optional description */
  description?: LocalizedTextDto;

  /** Optional parent department ID */
  parentId?: string;
}

/**
 * Query parameters for listing departments.
 * GET /organization/departments
 * Matches: backend/src/interface/organization/dto/list-departments.dto.ts
 */
export interface ListDepartmentsDto {
  /** Substring match against Arabic or English department name */
  search?: string;

  /** Restrict to direct children of this department ID */
  parentId?: string;

  /** 'true' to return only active units; omit for all */
  activeOnly?: string;

  /** Page size (1..200, default 50) */
  limit?: string;

  /** Zero-based offset */
  offset?: string;
}

// ============================================================================
// Command Input Types (matching backend command interfaces)
// ============================================================================

/**
 * Input for SyncDepartmentsCommand.
 * Matches: backend/src/application/organization/commands/sync-departments/sync-departments.command.ts
 */
export interface SyncDepartmentsInput {
  source?: string;
}

/**
 * Input for CreateDepartmentCommand.
 * Matches: backend/src/application/organization/commands/create-department/create-department.command.ts
 */
export interface CreateDepartmentInput {
  unitTypeCode: string;
  name: { ar: string; en?: string };
  description?: { ar: string; en?: string };
  parentId?: string;
}

// ============================================================================
// Query View Types (matching backend query ports)
// ============================================================================

/**
 * Department unit type view.
 * Source: backend/src/application/organization/ports/department-query.port.ts (DepartmentUnitTypeView)
 */
export interface DepartmentUnitTypeView {
  id: string;
  code: string;
  name: { ar: string; en?: string };
}

/**
 * Base department view.
 * Source: backend/src/application/organization/ports/department-query.port.ts (DepartmentView)
 */
export interface DepartmentView {
  id: string;
  parentId: string | null;
  unitType: DepartmentUnitTypeView;
  name: { ar: string; en?: string };
  description: { ar: string; en?: string } | null;
  isActive: boolean;
  sourceSystem: string;
  externalId: string | null;
  lastSyncedAt: string | null;
}

/**
 * Department tree node for hierarchy display.
 * Source: backend/src/application/organization/ports/department-query.port.ts (DepartmentTreeNode)
 */
export interface DepartmentTreeNode extends DepartmentView {
  children: DepartmentTreeNode[];
}

/**
 * Filter for listing departments.
 * Source: backend/src/application/organization/ports/department-query.port.ts (ListDepartmentsFilter)
 */
export interface ListDepartmentsFilter {
  search?: string;
  parentId?: string;
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Response Types (for API responses) - Match exact handler return shapes
// ============================================================================

/**
 * Result of syncing departments from external directory.
 * Matches: SyncDepartmentsHandler returns SyncDepartmentsResult from sync-departments-from-directory
 * Source: backend/src/application/organization/sync-departments-from-directory.ts
 */
export interface SyncDepartmentsResult {
  /** Source system name */
  source: string;
  /** Number of departments created */
  created: number;
  /** Number of departments updated */
  updated: number;
  /** Units this source owns that it no longer sends, switched off by pass 3. */
  deactivated: number;
  /** Total records processed */
  total: number;
}

/**
 * Result of creating a department.
 * Matches: CreateDepartmentHandler returns CreateDepartmentResult
 * Source: backend/src/application/organization/commands/create-department/create-department.handler.ts
 */
export interface CreateDepartmentResult {
  /** ID of the created department */
  id: string;
  /** Source system that owns this department (e.g., 'MANUAL') */
  sourceSystem: string;
}