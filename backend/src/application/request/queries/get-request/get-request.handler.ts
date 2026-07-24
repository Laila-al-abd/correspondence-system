import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Identifier } from '../../../../domain/shared/identifier'
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
  ) {}

  async execute(query: GetRequestQuery): Promise<RequestDetailView> {
    const id = Identifier.of(query.requestId)
    const request = await this.requests.findById(id)
    if (!request) throw new EntityNotFoundError('Request', query.requestId)

    const [actions, documents, payments] = await Promise.all([
      this.actions.listByRequest(id),
      this.documents.listByRequest(id),
      this.payments.listByRequest(id),
    ])
    return toRequestDetail(request, actions, documents, payments)
  }
}
