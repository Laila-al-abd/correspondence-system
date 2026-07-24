import { AssigneeType } from '../../../../domain/workflow/enums'
import { WorkflowPath } from '../../../../domain/workflow/workflow-path'

/** Read model for a single step within a workflow path. */
export interface WorkflowStepView {
  id: string
  name: { ar: string; en?: string }
  description?: { ar: string; en?: string }
  assigneeType: AssigneeType
  assigneeRoleId?: string
  assigneeDepartmentId?: string
  defaultActionTypeId?: string
  slaHours?: number
  pausesSla: boolean
  allowedActionTypeIds: string[]
  dependsOnStepIds: string[]
}

/** Read model returned by the workflow queries: a path and its full step graph. */
export interface WorkflowPathView {
  id: string
  templateId: string
  name: { ar: string; en?: string }
  description?: { ar: string; en?: string }
  isActive: boolean
  steps: WorkflowStepView[]
}

/** Projects a WorkflowPath aggregate into its read model. */
export function toWorkflowPathView(path: WorkflowPath): WorkflowPathView {
  const s = path.snapshot()
  return {
    id: path.id.toString(),
    templateId: s.templateId,
    name: s.name,
    description: s.description,
    isActive: s.isActive,
    steps: s.steps,
  }
}
