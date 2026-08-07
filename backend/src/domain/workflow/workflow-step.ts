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
  /**
   * What this step costs the requester, if anything. Absent means free, which
   * is the case for all but a handful of steps.
   *
   * The fee lives on the step and not on the template because a fee is not a
   * property of a kind of paperwork, it is an event inside the process: the
   * cashier takes the money at one identifiable point, before one identifiable
   * person can carry on. A template-level fee could say how much but never when,
   * and "when" is the whole reason the system needs to know about it -- it is
   * what lets the step refuse to complete until the money is settled. It also
   * matches the payments table, which already points at a step instance.
   */
  feeAmount?: number
  feeCurrency?: string
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
      feeAmount?: number
      feeCurrency?: string
    },
  ): WorkflowStep {
    WorkflowStep.assertAssigneeConsistent(p.assigneeType, p.assigneeRoleId, p.assigneeDepartmentId)
    if (p.slaHours !== undefined && p.slaHours <= 0)
      throw new InvariantViolationError("slaHours must be positive when set.")
    // A zero fee is not a fee. Allowing it would create payment rows that are
    // settled by paying nothing, and a step that blocks on them.
    if (p.feeAmount !== undefined && !(p.feeAmount > 0))
      throw new InvariantViolationError("feeAmount must be positive when set.")
    return new WorkflowStep(id, {
      name: p.name,
      description: p.description,
      assigneeType: p.assigneeType,
      assigneeRoleId: p.assigneeRoleId,
      assigneeDepartmentId: p.assigneeDepartmentId,
      defaultActionTypeId: p.defaultActionTypeId,
      slaHours: p.slaHours,
      pausesSla: p.pausesSla ?? false,
      feeAmount: p.feeAmount,
      feeCurrency: p.feeAmount !== undefined ? (p.feeCurrency ?? "SYP") : undefined,
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

  /**
   * The declared fee, as one value or nothing at all -- callers should never
   * have to decide what an amount without a currency means.
   */
  get fee(): { amount: number; currency: string } | undefined {
    if (this.props.feeAmount === undefined) return undefined
    return { amount: this.props.feeAmount, currency: this.props.feeCurrency ?? "SYP" }
  }

  chargesFee(): boolean { return this.props.feeAmount !== undefined }

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
    feeAmount?: number
    feeCurrency?: string
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
      feeAmount: this.props.feeAmount,
      feeCurrency: this.props.feeCurrency,
      allowedActionTypeIds: [...this.props.allowedActionTypeIds],
      dependsOnStepIds: [...this.props.dependsOnStepIds],
    }
  }
}
