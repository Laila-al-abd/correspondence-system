import { AssigneeType } from '../../../../domain/workflow/enums'

export interface WorkflowStepInput {
  /** Caller-supplied temporary key used to wire dependencies within this request. */
  key: string
  name: { ar: string; en?: string }
  description?: { ar: string; en?: string }
  assigneeType: AssigneeType
  assigneeRoleId?: string
  assigneeDepartmentId?: string
  defaultActionTypeId?: string
  slaHours?: number
  pausesSla?: boolean
  allowedActionTypeIds?: string[]
  /** Keys of the steps that must finish before this one (a DAG edge). */
  dependsOn?: string[]
}

export interface DefineWorkflowPathInput {
  templateId: string
  name: { ar: string; en?: string }
  description?: { ar: string; en?: string }
  steps: WorkflowStepInput[]
  /** When true the path is validated and activated, deactivating any other active path for the template. */
  activate?: boolean
}

export class DefineWorkflowPathCommand {
  constructor(public readonly input: DefineWorkflowPathInput) {}
}
