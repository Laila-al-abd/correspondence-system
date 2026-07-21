import { Injectable } from '@nestjs/common'
import { Prisma } from '../../../generated/prisma/client'
import { WorkflowPath } from '../../domain/workflow/workflow-path'
import { WorkflowPathRepository } from '../../domain/workflow/ports/workflow-path.repository'
import { Identifier } from '../../domain/shared/identifier'
import { PrismaService } from '../persistence/prisma.service'
import { WorkflowPathMapper, workflowPathInclude } from './workflow-path.mapper'

/**
 * Prisma-backed WorkflowPathRepository. A path is an aggregate spread across
 * four tables (path -> steps -> allowed actions + dependency edges), so reads
 * eager-load every child and save() rewrites the whole child set in one
 * transaction so the stored graph mirrors the in-memory aggregate exactly.
 */
@Injectable()
export class PrismaWorkflowPathRepository implements WorkflowPathRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier): Promise<WorkflowPath | null> {
    const row = await this.prisma.workflowPath.findFirst({
      where: { id: BigInt(id.toString()), deletedAt: null },
      include: workflowPathInclude,
    })
    return row ? WorkflowPathMapper.toDomain(row) : null
  }

  async findActiveByTemplate(templateId: Identifier): Promise<WorkflowPath | null> {
    const row = await this.prisma.workflowPath.findFirst({
      where: {
        templateId: BigInt(templateId.toString()),
        isActive: true,
        deletedAt: null,
      },
      include: workflowPathInclude,
      orderBy: { id: 'asc' },
    })
    return row ? WorkflowPathMapper.toDomain(row) : null
  }

  async listByTemplate(templateId: Identifier): Promise<WorkflowPath[]> {
    const rows = await this.prisma.workflowPath.findMany({
      where: { templateId: BigInt(templateId.toString()), deletedAt: null },
      include: workflowPathInclude,
      orderBy: { id: 'asc' },
    })
    return rows.map((row) => WorkflowPathMapper.toDomain(row))
  }

  async save(path: WorkflowPath): Promise<void> {
    const root = WorkflowPathMapper.toRoot(path)
    const id = BigInt(path.id.toString())
    const snapshot = path.snapshot()

    await this.prisma.$transaction(async (tx) => {
      await tx.workflowPath.upsert({
        where: { id },
        create: root,
        update: root,
      })

      // Rewrite the child graph. Dependency rows must go first: the depends-on
      // side of the self-join has no cascade, so deleting steps directly could
      // violate that foreign key. Remove edges in both directions, then the
      // allowed-action rows, then the steps themselves.
      const existing = await tx.workflowStep.findMany({
        where: { workflowPathId: id },
        select: { id: true },
      })
      const existingIds = existing.map((s) => s.id)
      if (existingIds.length) {
        await tx.workflowStepDependency.deleteMany({
          where: {
            OR: [
              { workflowStepId: { in: existingIds } },
              { dependsOnStepId: { in: existingIds } },
            ],
          },
        })
        await tx.workflowStepAllowedAction.deleteMany({
          where: { workflowStepId: { in: existingIds } },
        })
        await tx.workflowStep.deleteMany({ where: { workflowPathId: id } })
      }

      // Create all steps first so dependency/allowed-action FKs resolve.
      for (const step of snapshot.steps) {
        await tx.workflowStep.create({
          data: {
            id: BigInt(step.id),
            workflowPathId: id,
            name: step.name as Prisma.InputJsonValue,
            description: step.description
              ? (step.description as Prisma.InputJsonValue)
              : Prisma.JsonNull,
            assigneeType: step.assigneeType,
            assigneeRoleId: step.assigneeRoleId
              ? BigInt(step.assigneeRoleId)
              : null,
            assigneeDepartmentId: step.assigneeDepartmentId
              ? BigInt(step.assigneeDepartmentId)
              : null,
            defaultActionTypeId: step.defaultActionTypeId
              ? BigInt(step.defaultActionTypeId)
              : null,
            slaHours: step.slaHours ?? null,
            pausesSla: step.pausesSla,
          },
        })
      }

      // Then wire up allowed actions and dependency edges between steps.
      for (const step of snapshot.steps) {
        const stepId = BigInt(step.id)
        if (step.allowedActionTypeIds.length) {
          await tx.workflowStepAllowedAction.createMany({
            data: step.allowedActionTypeIds.map((actionTypeId) => ({
              workflowStepId: stepId,
              actionTypeId: BigInt(actionTypeId),
            })),
            skipDuplicates: true,
          })
        }
        if (step.dependsOnStepIds.length) {
          await tx.workflowStepDependency.createMany({
            data: step.dependsOnStepIds.map((dependsOnStepId) => ({
              workflowStepId: stepId,
              dependsOnStepId: BigInt(dependsOnStepId),
            })),
            skipDuplicates: true,
          })
        }
      }
    })
  }
}
