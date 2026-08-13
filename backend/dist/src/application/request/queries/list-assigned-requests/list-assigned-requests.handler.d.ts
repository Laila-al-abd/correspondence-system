import { IQueryHandler } from '@nestjs/cqrs';
import type { RequestQueryPort } from '../../ports/request-query.port';
import { KeysetPage } from '../../../shared/pagination';
import { ListAssignedRequestsQuery } from './list-assigned-requests.query';
import { RequestSummaryView } from '../views/request.view';
export declare class ListAssignedRequestsHandler implements IQueryHandler<ListAssignedRequestsQuery, KeysetPage<RequestSummaryView>> {
    private readonly requests;
    constructor(requests: RequestQueryPort);
    execute(query: ListAssignedRequestsQuery): Promise<KeysetPage<RequestSummaryView>>;
}
