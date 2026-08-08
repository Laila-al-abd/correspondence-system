/**
 * Frontend TypeScript types for the Workflow module.
 * Synchronized with backend DTOs, command interfaces, and query views.
 * Generated from:
 * - backend/src/interface/workflow/dto/*.dto.ts
 * - backend/src/application/workflow/commands/**.command.ts
 * - backend/src/application/workflow/queries/views/*.view.ts
 * - backend/src/domain/workflow/enums.ts
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Assignee types for workflow steps.
 * Source: backend/src/domain/workflow/enums.ts (AssigneeType)
 */
export enum AssigneeType {
  SPECIFIC_UNIT = 'SPECIFIC_UNIT',
  SPECIFIC_ROLE = 'SPECIFIC_ROLE',
  REQUESTER_DEPARTMENT_HEAD = 'REQUESTER_DEPARTMENT_HEAD',
  REQUESTER_FACULTY_DEAN = 'REQUESTER_FACULTY_DEAN',
}

// ============================================================================
// DTO Types (matching backend DTOs)
// ============================================================================

/**
 * Localized text DTO for workflow operations.
 * Matches: backend/src/interface/workflow/dto/define-workflow-path.dto.ts (LocalizedTextDto)
 */
export interface LocalizedTextDto {
  ar: string;
  en?: string;
}

/**
 * Workflow step definition DTO.
 * Matches: backend/src/interface/workflow/dto/define-workflow-path.dto.ts (WorkflowStepDto)
 */
export interface WorkflowStepDto {
  key: string;
  name: LocalizedTextDto;
  description?: LocalizedTextDto;
  assigneeType: AssigneeType;
  assigneeRoleId?: string;
  assigneeDepartmentId?: string;
  defaultActionTypeId?: string;
  slaHours?: number;
  pausesSla?: boolean;
  allowedActionTypeIds?: string[];
  dependsOn?: string[];
}

/**
 * Request body for defining a workflow path.
 * POST /workflow-paths
 * Matches: backend/src/interface/workflow/dto/define-workflow-path.dto.ts (DefineWorkflowPathDto)
 */
export interface DefineWorkflowPathDto {
  templateId: string;
  name: LocalizedTextDto;
  description?: LocalizedTextDto;
  steps: WorkflowStepDto[];
  activate?: boolean;
}

// ============================================================================
// Query View Types (matching backend query views)
// ============================================================================

/**
 * Workflow step view (read model).
 * Source: backend/src/application/workflow/queries/views/workflow-path.view.ts (WorkflowStepView)
 */
export interface WorkflowStepView {
  id: string;
  name: { ar: string; en?: string };
  description?: { ar: string; en?: string };
  assigneeType: AssigneeType;
  assigneeRoleId?: string;
  assigneeDepartmentId?: string;
  defaultActionTypeId?: string;
  slaHours?: number;
  pausesSla: boolean;
  allowedActionTypeIds: string[];
  dependsOnStepIds: string[];
}

/**
 * Workflow path view (read model with full step graph).
 * Source: backend/src/application/workflow/queries/views/workflow-path.view.ts (WorkflowPathView)
 */
export interface WorkflowPathView {
  id: string;
  templateId: string;
  name: { ar: string; en?: string };
  description?: { ar: string; en?: string };
  isActive: boolean;
  steps: WorkflowStepView[];
}

// ============================================================================
// Response Types (for API responses) - Match exact handler return shapes
// ============================================================================

/**
 * Define workflow path response.
 * POST /workflow-paths
 * Matches: DefineWorkflowPathHandler returns DefineWorkflowPathResult
 * Source: backend/src/application/workflow/commands/define-workflow-path/define-workflow-path.handler.ts
 */
export interface DefineWorkflowPathResponse {
  id: string;
  stepCount: number;
  isActive: boolean;
}

/**
 * Activate workflow path response.
 * POST /workflow-paths/:id/activate
 * Matches: ActivateWorkflowPathHandler returns WorkflowPathStateResult
 * Source: backend/src/application/workflow/commands/activate-workflow-path/activate-workflow-path.handler.ts
 */
export interface ActivateWorkflowPathResponse {
  id: string;
  isActive: boolean;
}

/**
 * Deactivate workflow path response.
 * POST /workflow-paths/:id/deactivate
 * Matches: DeactivateWorkflowPathHandler returns WorkflowPathStateResult
 * Source: backend/src/application/workflow/commands/deactivate-workflow-path/deactivate-workflow-path.handler.ts
 */
export interface DeactivateWorkflowPathResponse {
  id: string;
  isActive: boolean;
}