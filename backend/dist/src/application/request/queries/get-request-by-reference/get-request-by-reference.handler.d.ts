import { IQueryHandler } from '@nestjs/cqrs';
import type { RequestRepository } from '../../../../domain/request/ports/request.repository';
import type { RequestActionRepository } from '../../../../domain/request/ports/request-action.repository';
import type { DocumentRepository } from '../../../../domain/request/ports/document.repository';
import type { PaymentRepository } from '../../../../domain/request/ports/payment.repository';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import { GetRequestByReferenceQuery } from './get-request-by-reference.query';
import { RequestDetailView } from '../views/request.view';
export declare class GetRequestByReferenceHandler implements IQueryHandler<GetRequestByReferenceQuery, RequestDetailView> {
    private readonly requests;
    private readonly actions;
    private readonly documents;
    private readonly payments;
    private readonly templates;
    constructor(requests: RequestRepository, actions: RequestActionRepository, documents: DocumentRepository, payments: PaymentRepository, templates: TemplateRepository);
    execute(query: GetRequestByReferenceQuery): Promise<RequestDetailView>;
}
