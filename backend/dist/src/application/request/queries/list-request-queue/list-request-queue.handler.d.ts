import { IQueryHandler } from '@nestjs/cqrs';
import type { RequestQueryPort } from '../../ports/request-query.port';
import { KeysetPage } from '../../../shared/pagination';
import { ListRequestQueueQuery } from './list-request-queue.query';
import { RequestSummaryView } from '../views/request.view';
export declare class ListRequestQueueHandler implements IQueryHandler<ListRequestQueueQuery, KeysetPage<RequestSummaryView>> {
    private readonly requests;
    constructor(requests: RequestQueryPort);
    execute(query: ListRequestQueueQuery): Promise<KeysetPage<RequestSummaryView>>;
}
