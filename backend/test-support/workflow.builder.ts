/**
 * Builders for workflow aggregates in tests.
 *
 * A WorkflowPath is not hard to construct, but constructing one inline costs
 * six lines of Identifier.of / LocalizedText.create noise per step, and a test
 * that is 80% noise is a test nobody reads when it fails. These builders keep
 * the fixture down to the two facts a routing test is actually about: what the
 * step's assignee strategy is, and what it depends on.
 *
 * `legacy: true` exists for one specific reason. WorkflowStep.create refuses to
 * build a SPECIFIC_ROLE step without a role, but rehydrate() -- the path taken
 * when loading a row from the database -- does not, because rows authored
 * before that invariant existed are still in the table. Those rows are the ones
 * that used to route a step to a stranger, so the resolver guards against them
 * again, and a test cannot reach that guard through create(). `legacy: true`
 * builds the invalid-but-real row.
 */
import { Identifier } from '../src/domain/shared/identifier'
import { LocalizedText } from '../src/domain/shared/localized-text'
import { AssigneeType } from '../src/domain/workflow/enums'
import { WorkflowPath } from '../src/domain/workflow/workflow-path'
import { WorkflowStep } from '../src/domain/workflow/workflow-step'

export interface StepSpec {
  id: string
  /** Defaults to SPECIFIC_ROLE, the common case. */
  assigneeType?: AssigneeType
  roleId?: string
  departmentId?: string
  /** Ids of steps that must finish before this one opens. */
  dependsOn?: string[]
  slaHours?: number
  feeAmount?: number
  feeCurrency?: string
  /** Bypass WorkflowStep.create's invariants, as loading an old row does. */
  legacy?: boolean
}

export interface PathSpec {
  id?: string
  templateId?: string
  steps: StepSpec[]
}

export function buildStep(spec: StepSpec): WorkflowStep {
  const assigneeType = spec.assigneeType ?? AssigneeType.SPECIFIC_ROLE
  const roleId = spec.roleId ? Identifier.of(spec.roleId) : undefined
  const departmentId = spec.departmentId
    ? Identifier.of(spec.departmentId)
    : undefined

  const step = spec.legacy
    ? WorkflowStep.rehydrate(Identifier.of(spec.id), {
        name: LocalizedText.create(spec.id),
        assigneeType,
        assigneeRoleId: roleId,
        assigneeDepartmentId: departmentId,
        slaHours: spec.slaHours,
        pausesSla: false,
        feeAmount: spec.feeAmount,
        feeCurrency:
          spec.feeAmount !== undefined
            ? (spec.feeCurrency ?? 'SYP')
            : undefined,
        allowedActionTypeIds: new Set<string>(),
        dependsOnStepIds: new Set<string>(),
      })
    : WorkflowStep.create(Identifier.of(spec.id), {
        name: LocalizedText.create(spec.id),
        assigneeType,
        assigneeRoleId: roleId,
        assigneeDepartmentId: departmentId,
        slaHours: spec.slaHours,
        feeAmount: spec.feeAmount,
        feeCurrency: spec.feeCurrency,
      })

  for (const dependency of spec.dependsOn ?? [])
    step.dependOn(Identifier.of(dependency))
  return step
}

export function buildPath(spec: PathSpec): WorkflowPath {
  const path = WorkflowPath.create(Identifier.of(spec.id ?? 'path-1'), {
    templateId: Identifier.of(spec.templateId ?? 'template-1'),
    name: LocalizedText.create('مسار اختباري', 'Test path'),
  })
  for (const step of spec.steps) path.addStep(buildStep(step))
  return path
}

/** Reads an owner out of a resolveForPath result as a plain string. */
export function ownerOf(
  owners: Map<string, Identifier>,
  stepId: string,
): string | undefined {
  return owners.get(stepId)?.toString()
}
