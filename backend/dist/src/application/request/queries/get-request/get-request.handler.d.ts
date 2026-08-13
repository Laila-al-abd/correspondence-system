import { IQueryHandler } from '@nestjs/cqrs';
import type { RequestRepository } from '../../../../domain/request/ports/request.repository';
import type { RequestActionRepository } from '../../../../domain/request/ports/request-action.repository';
import type { DocumentRepository } from '../../../../domain/request/ports/document.repository';
import type { PaymentRepository } from '../../../../domain/request/ports/payment.repository';
import type { TemplateRepository } from '../../../../domain/catalog/ports/template.repository';
import type { WorkflowPathRepository } from '../../../../domain/workflow/ports/workflow-path.repository';
import type { RequestQueryPort } from '../../ports/request-query.port';
import { RequestReadAccessPolicy } from '../../policies/request-read-access.policy';
import { GetRequestQuery } from './get-request.query';
import { RequestDetailView } from '../views/request.view';
export declare class GetRequestHandler implements IQueryHandler<GetRequestQuery, RequestDetailView> {
    private readonly requests;
    private readonly actions;
    private readonly documents;
    private readonly payments;
    private readonly requestQuery;
    private readonly templates;
    private readonly workflowPaths;
    private readonly readAccess;
    constructor(requests: RequestRepository, actions: RequestActionRepository, documents: DocumentRepository, payments: PaymentRepository, requestQuery: RequestQueryPort, templates: TemplateRepository, workflowPaths: WorkflowPathRepository, readAccess: RequestReadAccessPolicy);
    execute(query: GetRequestQuery): Promise<RequestDetailView>;
}
