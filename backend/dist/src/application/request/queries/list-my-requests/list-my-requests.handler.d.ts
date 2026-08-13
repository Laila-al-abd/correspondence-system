import { IQueryHandler } from '@nestjs/cqrs';
import type { RequestQueryPort } from '../../ports/request-query.port';
import { KeysetPage } from '../../../shared/pagination';
import { ListMyRequestsQuery } from './list-my-requests.query';
import { RequestSummaryView } from '../views/request.view';
export declare class ListMyRequestsHandler implements IQueryHandler<ListMyRequestsQuery, KeysetPage<RequestSummaryView>> {
    private readonly requests;
    constructor(requests: RequestQueryPort);
    execute(query: ListMyRequestsQuery): Promise<KeysetPage<RequestSummaryView>>;
}
