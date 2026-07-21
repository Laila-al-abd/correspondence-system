import { Prisma } from '../../../generated/prisma/client'
import { WorkflowPath } from '../../domain/workflow/workflow-path'
import { WorkflowStep } from '../../domain/workflow/workflow-step'
import { AssigneeType } from '../../domain/workflow/enums'
import { Identifier } from '../../domain/shared/identifier'
import { LocalizedText } from '../../domain/shared/localized-text'

/**
 * Relations a WorkflowPath must load to rebuild the whole aggregate: its steps,
 * each step's allowed actions, and each step's dependency edges (the incoming
 * `workflowStepId` side of the self-join gives "this step depends on ...").
 */
export const workflowPathInclude = {
  steps: { include: { allowedActions: true, dependencies: true } },
} satisfies Prisma.WorkflowPathInclude

type WorkflowPathRow = Prisma.WorkflowPathGetPayload<{
  include: typeof workflowPathInclude
}>

type Bilingual = { ar: string; en?: string }

const toLocalized = (json: Prisma.JsonValue): LocalizedText => {
  const value = json as unknown as Bilingual
  return LocalizedText.create(value.ar, value.en)
}

/**
 * Maps between the WorkflowPath aggregate (root + steps + allowed actions +
 * dependency edges) and its Prisma rows.
 */
export const WorkflowPathMapper = {
  toDomain(row: WorkflowPathRow): WorkflowPath {
    const steps = row.steps.map((s) =>
      WorkflowStep.rehydrate(Identifier.of(s.id), {
        name: toLocalized(s.name),
        description: s.description ? toLocalized(s.description) : undefined,
        assigneeType: s.assigneeType as AssigneeType,
        assigneeRoleId:
          s.assigneeRoleId != null ? Identifier.of(s.assigneeRoleId) : undefined,
        assigneeDepartmentId:
          s.assigneeDepartmentId != null
            ? Identifier.of(s.assigneeDepartmentId)
            : undefined,
        defaultActionTypeId:
          s.defaultActionTypeId != null
            ? Identifier.of(s.defaultActionTypeId)
            : undefined,
        slaHours: s.slaHours != null ? s.slaHours.toNumber() : undefined,
        pausesSla: s.pausesSla,
        allowedActionTypeIds: new Set(
          s.allowedActions.map((a) => a.actionTypeId.toString()),
        ),
        dependsOnStepIds: new Set(
          s.dependencies.map((d) => d.dependsOnStepId.toString()),
        ),
      }),
    )

    return WorkflowPath.rehydrate(Identifier.of(row.id), {
      templateId: Identifier.of(row.templateId),
      name: toLocalized(row.name),
      description: row.description ? toLocalized(row.description) : undefined,
      isActive: row.isActive,
      steps,
    })
  },

  /** Scalar columns of the path root row (steps/edges are written separately). */
  toRoot(path: WorkflowPath): Prisma.WorkflowPathUncheckedCreateInput {
    const s = path.snapshot()
    return {
      id: BigInt(path.id.toString()),
      templateId: BigInt(s.templateId),
      name: s.name as Prisma.InputJsonValue,
      description: s.description
        ? (s.description as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      isActive: s.isActive,
    }
  },
}
