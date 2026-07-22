import { Prisma, RequestStepInstance as StepInstanceRow } from '../../../generated/prisma/client'
import { Request } from '../../domain/request/request'
import { RequestStepInstance } from '../../domain/request/request-step-instance'
import type { StepInstanceSnapshot } from '../../domain/request/request-step-instance'
import {
  ClassificationStatus,
  ClassifiedBy,
  Priority,
  RequestStatus,
  SlaRisk,
  StepInstanceStatus,
} from '../../domain/request/enums'
import { Identifier } from '../../domain/shared/identifier'

/** A request eager-loads its runtime step instances to rebuild the aggregate. */
export const requestInclude = {
  stepInstances: true,
} satisfies Prisma.RequestInclude

type RequestWithChildren = Prisma.RequestGetPayload<{
  include: typeof requestInclude
}>

const toStepInstanceDomain = (row: StepInstanceRow): RequestStepInstance =>
  RequestStepInstance.rehydrate(Identifier.of(row.id), {
    requestId: Identifier.of(row.requestId),
    workflowStepId: Identifier.of(row.workflowStepId),
    assignedToUserId:
      row.assignedToUserId != null
        ? Identifier.of(row.assignedToUserId)
        : undefined,
    status: row.status as StepInstanceStatus,
    slaDueAt: row.slaDueAt ?? undefined,
    slaPaused: row.slaPaused,
    startedAt: row.startedAt ?? undefined,
    completedAt: row.completedAt ?? undefined,
  })

/**
 * Maps between the Request aggregate (root + runtime step instances) and its
 * Prisma rows. The repository upserts step instances individually so that rows
 * referencing them (actions, payments) keep their foreign keys.
 */
export const RequestMapper = {
  toDomain(row: RequestWithChildren): Request {
    const stepInstances = row.stepInstances
      .slice()
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
      .map(toStepInstanceDomain)

    return Request.rehydrate(Identifier.of(row.id), {
      requesterId: Identifier.of(row.requesterId),
      rawText: row.rawText ?? undefined,
      templateId: row.templateId != null ? Identifier.of(row.templateId) : undefined,
      workflowPathId:
        row.workflowPathId != null ? Identifier.of(row.workflowPathId) : undefined,
      filledData: row.filledData
        ? (row.filledData as unknown as Record<string, unknown>)
        : {},
      classificationStatus: row.classificationStatus as ClassificationStatus,
      classificationConfidence:
        row.classificationConfidence != null
          ? row.classificationConfidence.toNumber()
          : undefined,
      classifiedBy: (row.classifiedBy as ClassifiedBy | null) ?? undefined,
      currentStatus: row.currentStatus as RequestStatus,
      priority: row.priority as Priority,
      slaRisk: row.slaRisk as SlaRisk,
      sensitivityLevelId:
        row.sensitivityLevelId != null
          ? Identifier.of(row.sensitivityLevelId)
          : undefined,
      slaDueAt: row.slaDueAt ?? undefined,
      completedAt: row.completedAt ?? undefined,
      stepInstances,
    })
  },

  /** Scalar columns of the request root (step instances are written separately). */
  toRoot(request: Request): Prisma.RequestUncheckedCreateInput {
    const s = request.snapshot()
    return {
      id: BigInt(request.id.toString()),
      requesterId: BigInt(s.requesterId),
      rawText: s.rawText ?? null,
      templateId: s.templateId ? BigInt(s.templateId) : null,
      workflowPathId: s.workflowPathId ? BigInt(s.workflowPathId) : null,
      filledData: s.filledData as Prisma.InputJsonValue,
      classificationStatus: s.classificationStatus,
      classificationConfidence: s.classificationConfidence ?? null,
      classifiedBy: s.classifiedBy ?? null,
      currentStatus: s.currentStatus,
      priority: s.priority,
      slaRisk: s.slaRisk,
      sensitivityLevelId: s.sensitivityLevelId ? BigInt(s.sensitivityLevelId) : null,
      slaDueAt: s.slaDueAt ?? null,
      completedAt: s.completedAt ?? null,
    }
  },

  /** A single runtime step-instance row belonging to its request. */
  toStepInstanceRow(
    si: StepInstanceSnapshot,
  ): Prisma.RequestStepInstanceUncheckedCreateInput {
    return {
      id: BigInt(si.id),
      requestId: BigInt(si.requestId),
      workflowStepId: BigInt(si.workflowStepId),
      assignedToUserId: si.assignedToUserId ? BigInt(si.assignedToUserId) : null,
      status: si.status,
      slaDueAt: si.slaDueAt ?? null,
      slaPaused: si.slaPaused,
      startedAt: si.startedAt ?? null,
      completedAt: si.completedAt ?? null,
    }
  },
}
