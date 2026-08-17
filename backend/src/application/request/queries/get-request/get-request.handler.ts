import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Identifier } from '../../../../domain/shared/identifier'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { RequestActionRepository } from '../../../../domain/request/ports/request-action.repository'
import type { DocumentRepository } from '../../../../domain/request/ports/document.repository'
import type { PaymentRepository } from '../../../../domain/request/ports/payment.repository'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository'
import type { RequestQueryPort } from '../../ports/request-query.port'
import {
  DOCUMENT_REPOSITORY,
  PAYMENT_REPOSITORY,
  REQUEST_ACTION_REPOSITORY,
  REQUEST_QUERY,
  REQUEST_REPOSITORY,
  TEMPLATE_REPOSITORY,
  WORKFLOW_PATH_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { RequestReadAccessPolicy } from '../../policies/request-read-access.policy'
import { GetRequestQuery } from './get-request.query'
import { RequestDetailView, toRequestDetail } from '../views/request.view'

/**
 * Loads the full picture of one request: the aggregate with its step instances,
 * plus its audit actions, documents, and payments -- assembled into a single
 * flat read model for the detail screen.
 */
@QueryHandler(GetRequestQuery)
export class GetRequestHandler
  implements IQueryHandler<GetRequestQuery, RequestDetailView>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(REQUEST_ACTION_REPOSITORY)
    private readonly actions: RequestActionRepository,
    @Inject(DOCUMENT_REPOSITORY) private readonly documents: DocumentRepository,
    @Inject(PAYMENT_REPOSITORY) private readonly payments: PaymentRepository,
    @Inject(REQUEST_QUERY) private readonly requestQuery: RequestQueryPort,
    @Inject(TEMPLATE_REPOSITORY) private readonly templates: TemplateRepository,
    @Inject(WORKFLOW_PATH_REPOSITORY)
    private readonly workflowPaths: WorkflowPathRepository,
    private readonly readAccess: RequestReadAccessPolicy,
  ) {}

  async execute(query: GetRequestQuery): Promise<RequestDetailView> {
    const id = Identifier.of(query.requestId)
    const request = await this.requests.findById(id)
    if (!request) throw new EntityNotFoundError('Request', query.requestId)

    // Authorized here rather than by a route decorator: the applicant who filed
    // this request must be able to read it, and applicants hold no permissions.
    await this.readAccess.assertMayRead(
      query.requestedBy,
      request.requesterId.toString(),
    )

    // The estimate answers "how long will this take", so it is fetched for the
    // detail screen only -- a list of thirty requests would repeat the same two
    // aggregates thirty times. An unclassified request has no template yet and
    // therefore nothing to compare itself against.
    // The template is loaded for its form definition, not for its text: without
    // the field list, labels and types, filledData is an unlabelled bag of keys
    // and no client can draw the confirmation form or say which answers are
    // still needed.
    const templateId = request.snapshot().templateId
    const workflowPathId = request.snapshot().workflowPathId
    const [actions, documents, payments, durationEstimate, template, workflowPath] =
      await Promise.all([
        this.actions.listByRequest(id),
        this.documents.listByRequest(id),
        this.payments.listByRequest(id),
        templateId
          ? this.requestQuery.estimateDuration(templateId)
          : Promise.resolve(undefined),
        templateId
          ? this.templates.findById(Identifier.of(templateId))
          : Promise.resolve(null),
        workflowPathId
          ? this.workflowPaths.findById(Identifier.of(workflowPathId))
          : Promise.resolve(null),
      ])

    // Compute the correct slaDueAt from open, non-paused step instances
    // Matching SlaMonitorService/PrismaSlaScan logic:
    // - Open statuses: PENDING, IN_PROGRESS, WAITING
    // - Not paused: slaPaused = false
    // - Min slaDueAt across all such steps
    const openStepInstances = request.snapshot().stepInstances.filter(
      (si) =>
        ['PENDING', 'IN_PROGRESS', 'WAITING'].includes(si.status) &&
        !si.slaPaused &&
        si.slaDueAt != null,
    )
    const computedSlaDueAt = openStepInstances.length > 0
      ? new Date(Math.min(...openStepInstances.map((si) => si.slaDueAt!.getTime())))
      : undefined

    // Assignee names are resolved here, once, for the whole request: the
    // screen has to print who each step is waiting on, and the browser cannot
    // find that out for itself because /users is behind user.manage.
    const assigneeIds = [
      ...new Set(
        request
          .snapshot()
          .stepInstances.map((si) => si.assignedToUserId)
          .filter((id): id is string => !!id),
      ),
    ]
    const assigneeNames =
      assigneeIds.length > 0 && this.requestQuery.resolveUserDisplayNames
        ? await this.requestQuery.resolveUserDisplayNames(assigneeIds)
        : {}

    const detail = toRequestDetail(
      request,
      actions,
      documents,
      payments,
      durationEstimate,
      template ?? undefined,
      workflowPath?.steps ? [...workflowPath.steps] : undefined,
      assigneeNames,
    )

    // Override slaDueAt with computed value
    return { ...detail, slaDueAt: computedSlaDueAt?.toISOString() }
  }
}
