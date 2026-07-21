import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"
import { InvariantViolationError } from "../shared/domain-error"
import { AssigneeType } from "./enums"

interface WorkflowStepProps {
  name: LocalizedText
  description?: LocalizedText
  assigneeType: AssigneeType
  assigneeRoleId?: Identifier
  assigneeDepartmentId?: Identifier
  defaultActionTypeId?: Identifier
  slaHours?: number
  pausesSla: boolean
  allowedActionTypeIds: Set<string>
  dependsOnStepIds: Set<string>
}

/**
 * One node in a workflow definition. Encodes WHO handles the step (via the
 * assignee strategy) and WHICH actions are permitted. Dependencies on other
 * steps turn the path into a DAG (validated by the WorkflowPath aggregate).
 */
export class WorkflowStep extends Entity {
  private constructor(id: Identifier, private props: WorkflowStepProps) {
    super(id)
  }

  static create(
    id: Identifier,
    p: {
      name: LocalizedText
      assigneeType: AssigneeType
      description?: LocalizedText
      assigneeRoleId?: Identifier
      assigneeDepartmentId?: Identifier
      defaultActionTypeId?: Identifier
      slaHours?: number
      pausesSla?: boolean
    },
  ): WorkflowStep {
    WorkflowStep.assertAssigneeConsistent(p.assigneeType, p.assigneeRoleId, p.assigneeDepartmentId)
    if (p.slaHours !== undefined && p.slaHours <= 0)
      throw new InvariantViolationError("slaHours must be positive when set.")
    return new WorkflowStep(id, {
      name: p.name,
      description: p.description,
      assigneeType: p.assigneeType,
      assigneeRoleId: p.assigneeRoleId,
      assigneeDepartmentId: p.assigneeDepartmentId,
      defaultActionTypeId: p.defaultActionTypeId,
      slaHours: p.slaHours,
      pausesSla: p.pausesSla ?? false,
      allowedActionTypeIds: new Set(),
      dependsOnStepIds: new Set(),
    })
  }

  static rehydrate(id: Identifier, props: WorkflowStepProps): WorkflowStep {
    return new WorkflowStep(id, props)
  }

  private static assertAssigneeConsistent(
    type: AssigneeType,
    roleId?: Identifier,
    departmentId?: Identifier,
  ): void {
    if (type === AssigneeType.SPECIFIC_ROLE && !roleId)
      throw new InvariantViolationError("A SPECIFIC_ROLE step requires an assignee role.")
    if (type === AssigneeType.SPECIFIC_UNIT && !departmentId)
      throw new InvariantViolationError("A SPECIFIC_UNIT step requires an assignee department.")
  }

  allowAction(actionTypeId: Identifier): void {
    this.props.allowedActionTypeIds.add(actionTypeId.toString())
  }

  dependOn(stepId: Identifier): void {
    if (stepId.equals(this.id))
      throw new InvariantViolationError("A step cannot depend on itself.")
    this.props.dependsOnStepIds.add(stepId.toString())
  }

  permits(actionTypeId: Identifier): boolean {
    return this.props.allowedActionTypeIds.has(actionTypeId.toString())
  }

  get dependencyIds(): string[] { return [...this.props.dependsOnStepIds] }
  get assigneeType(): AssigneeType { return this.props.assigneeType }
  get slaHours(): number | undefined { return this.props.slaHours }
  get pausesSla(): boolean { return this.props.pausesSla }

  snapshot(): {
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
  } {
    return {
      id: this.id.toString(),
      name: this.props.name.toJSON(),
      description: this.props.description?.toJSON(),
      assigneeType: this.props.assigneeType,
      assigneeRoleId: this.props.assigneeRoleId?.toString(),
      assigneeDepartmentId: this.props.assigneeDepartmentId?.toString(),
      defaultActionTypeId: this.props.defaultActionTypeId?.toString(),
      slaHours: this.props.slaHours,
      pausesSla: this.props.pausesSla,
      allowedActionTypeIds: [...this.props.allowedActionTypeIds],
      dependsOnStepIds: [...this.props.dependsOnStepIds],
    }
  }
}
