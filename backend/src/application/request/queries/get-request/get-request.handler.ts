import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Identifier } from '../../../../domain/shared/identifier'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { RequestActionRepository } from '../../../../domain/request/ports/request-action.repository'
import type { DocumentRepository } from '../../../../domain/request/ports/document.repository'
import type { PaymentRepository } from '../../../../domain/request/ports/payment.repository'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import type { RequestQueryPort } from '../../ports/request-query.port'
import {
  DOCUMENT_REPOSITORY,
  PAYMENT_REPOSITORY,
  REQUEST_ACTION_REPOSITORY,
  REQUEST_QUERY,
  REQUEST_REPOSITORY,
  TEMPLATE_REPOSITORY,
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
    const [actions, documents, payments, durationEstimate, template] =
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
      ])
    return toRequestDetail(
      request,
      actions,
      documents,
      payments,
      durationEstimate,
      template ?? undefined,
    )
  }
}
