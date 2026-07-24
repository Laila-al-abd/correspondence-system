import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { WorkflowPath } from '../../../../domain/workflow/workflow-path'
import { WorkflowStep } from '../../../../domain/workflow/workflow-step'
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import { Identifier } from '../../../../domain/shared/identifier'
import { LocalizedText } from '../../../../domain/shared/localized-text'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import {
  ID_GENERATOR,
  TEMPLATE_REPOSITORY,
  WORKFLOW_PATH_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { DefineWorkflowPathCommand } from './define-workflow-path.command'

export interface DefineWorkflowPathResult {
  id: string
  stepCount: number
  isActive: boolean
}

/**
 * Authors a complete workflow path for a template in one atomic operation: the
 * path plus its steps, allowed actions, and dependency edges. Steps reference
 * each other by a caller-supplied `key`, which is resolved to generated ids so a
 * client can describe the graph without knowing ids up front. When `activate` is
 * set, the path is validated (acyclic, has an entry step) and any previously
 * active path for the same template is deactivated, preserving the one-active-
 * path-per-template rule the request runtime relies on.
 */
@CommandHandler(DefineWorkflowPathCommand)
export class DefineWorkflowPathHandler
  implements
    ICommandHandler<DefineWorkflowPathCommand, DefineWorkflowPathResult>
{
  constructor(
    @Inject(WORKFLOW_PATH_REPOSITORY)
    private readonly workflowPaths: WorkflowPathRepository,
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templates: TemplateRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async execute({
    input,
  }: DefineWorkflowPathCommand): Promise<DefineWorkflowPathResult> {
    if (input.steps.length === 0)
      throw new InvariantViolationError(
        'A workflow path must have at least one step.',
      )

    const templateId = Identifier.of(input.templateId)
    if (!(await this.templates.findById(templateId)))
      throw new EntityNotFoundError('Template', input.templateId)

    this.assertUniqueKeys(input.steps.map((step) => step.key))

    const path = WorkflowPath.create(this.ids.next(), {
      templateId,
      name: LocalizedText.create(input.name.ar, input.name.en),
      description: input.description
        ? LocalizedText.create(input.description.ar, input.description.en)
        : undefined,
    })

    // Pass 1: create every step and remember key -> generated id.
    const idByKey = new Map<string, Identifier>()
    const authored = input.steps.map((stepInput) => {
      const step = WorkflowStep.create(this.ids.next(), {
        name: LocalizedText.create(stepInput.name.ar, stepInput.name.en),
        description: stepInput.description
          ? LocalizedText.create(
              stepInput.description.ar,
              stepInput.description.en,
            )
          : undefined,
        assigneeType: stepInput.assigneeType,
        assigneeRoleId: stepInput.assigneeRoleId
          ? Identifier.of(stepInput.assigneeRoleId)
          : undefined,
        assigneeDepartmentId: stepInput.assigneeDepartmentId
          ? Identifier.of(stepInput.assigneeDepartmentId)
          : undefined,
        defaultActionTypeId: stepInput.defaultActionTypeId
          ? Identifier.of(stepInput.defaultActionTypeId)
          : undefined,
        slaHours: stepInput.slaHours,
        pausesSla: stepInput.pausesSla,
      })
      for (const actionTypeId of stepInput.allowedActionTypeIds ?? [])
        step.allowAction(Identifier.of(actionTypeId))
      path.addStep(step)
      idByKey.set(stepInput.key, step.id)
      return { stepInput, step }
    })

    // Pass 2: wire dependency edges now that every key has an id.
    for (const { stepInput, step } of authored) {
      for (const dependencyKey of stepInput.dependsOn ?? []) {
        const dependencyId = idByKey.get(dependencyKey)
        if (!dependencyId)
          throw new InvariantViolationError(
            `Step '${stepInput.key}' depends on unknown step '${dependencyKey}'.`,
          )
        step.dependOn(dependencyId)
      }
    }

    if (input.activate) {
      path.activate()
      await this.deactivateCurrentActive(templateId, path.id)
    } else {
      path.deactivate()
    }

    await this.workflowPaths.save(path)
    return {
      id: path.id.toString(),
      stepCount: path.steps.length,
      isActive: path.isActive,
    }
  }

  private assertUniqueKeys(keys: string[]): void {
    const seen = new Set<string>()
    for (const key of keys) {
      if (seen.has(key))
        throw new InvariantViolationError(`Duplicate step key '${key}'.`)
      seen.add(key)
    }
  }

  private async deactivateCurrentActive(
    templateId: Identifier,
    newPathId: Identifier,
  ): Promise<void> {
    const current = await this.workflowPaths.findActiveByTemplate(templateId)
    if (current && !current.id.equals(newPathId)) {
      current.deactivate()
      await this.workflowPaths.save(current)
    }
  }
}
