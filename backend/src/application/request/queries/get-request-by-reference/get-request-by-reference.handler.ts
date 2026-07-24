import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { RequestRepository } from '../../../../domain/request/ports/request.repository'
import type { RequestActionRepository } from '../../../../domain/request/ports/request-action.repository'
import type { DocumentRepository } from '../../../../domain/request/ports/document.repository'
import type { PaymentRepository } from '../../../../domain/request/ports/payment.repository'
import {
  DOCUMENT_REPOSITORY,
  PAYMENT_REPOSITORY,
  REQUEST_ACTION_REPOSITORY,
  REQUEST_REPOSITORY,
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
  ) {}

  async execute(
    query: GetRequestByReferenceQuery,
  ): Promise<RequestDetailView> {
    const request = await this.requests.findByReferenceNo(query.referenceNo)
    if (!request) throw new EntityNotFoundError('Request', query.referenceNo)

    const id = request.id
    const [actions, documents, payments] = await Promise.all([
      this.actions.listByRequest(id),
      this.documents.listByRequest(id),
      this.payments.listByRequest(id),
    ])
    return toRequestDetail(request, actions, documents, payments)
  }
}
