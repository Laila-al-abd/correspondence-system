import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { RequestActionRepository } from '../../../../domain/request/ports/request-action.repository'
import type { DocumentRepository } from '../../../../domain/request/ports/document.repository'
import type { PaymentRepository } from '../../../../domain/request/ports/payment.repository'
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository'
import { Identifier } from '../../../../domain/shared/identifier'
import {
  DOCUMENT_REPOSITORY,
  PAYMENT_REPOSITORY,
  REQUEST_ACTION_REPOSITORY,
  REQUEST_REPOSITORY,
  TEMPLATE_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { GetRequestByReferenceQuery } from './get-request-by-reference.query'
import { RequestDetailView, toRequestDetail } from '../views/request.view'

/**
 * Looks a request up by its human-readable reference number -- the number staff
 * and applicants actually quote -- and returns the same full detail read model
 * as get-request.
 */
@QueryHandler(GetRequestByReferenceQuery)
export class GetRequestByReferenceHandler
  implements IQueryHandler<GetRequestByReferenceQuery, RequestDetailView>
{
  constructor(
    @Inject(REQUEST_REPOSITORY) private readonly requests: RequestRepository,
    @Inject(REQUEST_ACTION_REPOSITORY)
    private readonly actions: RequestActionRepository,
    @Inject(DOCUMENT_REPOSITORY) private readonly documents: DocumentRepository,
    @Inject(PAYMENT_REPOSITORY) private readonly payments: PaymentRepository,
    @Inject(TEMPLATE_REPOSITORY) private readonly templates: TemplateRepository,
  ) {}

  async execute(
    query: GetRequestByReferenceQuery,
  ): Promise<RequestDetailView> {
    const request = await this.requests.findByReferenceNo(query.referenceNo)
    if (!request) throw new EntityNotFoundError('Request', query.referenceNo)

    const id = request.id
    const templateId = request.snapshot().templateId
    const [actions, documents, payments, template] = await Promise.all([
      this.actions.listByRequest(id),
      this.documents.listByRequest(id),
      this.payments.listByRequest(id),
      templateId
        ? this.templates.findById(Identifier.of(templateId))
        : Promise.resolve(null),
    ])
    // No duration estimate on this route, as before: it is the lookup staff use
    // to find a request by the number someone quoted, not the detail screen.
    return toRequestDetail(
      request,
      actions,
      documents,
      payments,
      undefined,
      template ?? undefined,
    )
  }
}
