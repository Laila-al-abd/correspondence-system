import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Identifier } from '../../../../domain/shared/identifier'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository'
import {
  REQUEST_REPOSITORY,
  WORKFLOW_PATH_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { AssigneeResolver } from '../../services/assignee-resolver'
import { ListStepCandidatesQuery } from './list-step-candidates.query'

export interface StepCandidateView {
  userId: string
  /** How many open steps this person already holds, for load-aware picking. */
  openStepCount: number
  /** True when automatic routing would also have considered this person. */
  recommended: boolean
}

export interface StepCandidatesView {
  stepInstanceId: string
  workflowStepId: string
  stepName?: string
  assigneeType?: string
  assigneeRoleId?: string
  currentAssigneeUserId?: string
  /** Least-busy first, recommended tier before the wider tier. */
  candidates: StepCandidateView[]
  /**
   * True when the step's definition could not be resolved (the path was
   * retired, say). The client should then fall back to the full user list,
   * which is what AssignStepHandler permits in that case.
   */
  unrestricted: boolean
}

/**
 * Answers "who can I give this step to?" for the manual-assignment dropdown.
 *
 * It exists because an admin who receives a STEP_ASSIGNMENT_REQUIRED
 * notification previously had no way to act on it: the assign endpoint was
 * there, but nothing told the admin which of several hundred users the step
 * would actually accept, and guessing wrong returns 403.
 *
 * The rules here are the same ones AssignStepHandler enforces, on purpose. A
 * dropdown that offers a choice the command then rejects is worse than no
 * dropdown at all.
 */
@QueryHandler(ListStepCandidatesQuery)
export class ListStepCandidatesHandler
  implements IQueryHandler<ListStepCandidatesQuery, StepCandidatesView>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(WORKFLOW_PATH_REPOSITORY)
    private readonly workflowPaths: WorkflowPathRepository,
    private readonly assignees: AssigneeResolver,
  ) {}

  async execute(query: ListStepCandidatesQuery): Promise<StepCandidatesView> {
    const request = await this.requests.findById(
      Identifier.of(query.requestId),
    )
    if (!request) throw new EntityNotFoundError('Request', query.requestId)

    const step = request.stepInstances.find(
      (si) => si.id.toString() === query.stepInstanceId,
    )
    if (!step)
      throw new EntityNotFoundError('Step instance', query.stepInstanceId)

    const stepSnapshot = step.snapshot()
    const base = {
      stepInstanceId: step.id.toString(),
      workflowStepId: stepSnapshot.workflowStepId,
      currentAssigneeUserId: stepSnapshot.assignedToUserId,
    }

    const pathId = request.workflowPathId
    const path = pathId ? await this.workflowPaths.findById(pathId) : null
    const definition = path?.steps.find(
      (candidate) => candidate.id.toString() === stepSnapshot.workflowStepId,
    )
    if (!definition)
      return { ...base, candidates: [], unrestricted: true }

    const definitionSnapshot = definition.snapshot()
    const { recommended, wider } =
      await this.assignees.assignableUsersForStep(
        definition,
        request.requesterId,
      )

    const candidates: StepCandidateView[] = [
      ...recommended.map((c) => ({ ...c, recommended: true })),
      ...wider.map((c) => ({ ...c, recommended: false })),
    ]

    return {
      ...base,
      stepName: definitionSnapshot.name.ar || definitionSnapshot.name.en,
      assigneeType: definitionSnapshot.assigneeType,
      assigneeRoleId: definitionSnapshot.assigneeRoleId,
      candidates,
      // No eligible person at all: the command permits anyone active rather than
      // letting the request stall, so the client may widen the dropdown too.
      unrestricted: candidates.length === 0,
    }
  }
}
