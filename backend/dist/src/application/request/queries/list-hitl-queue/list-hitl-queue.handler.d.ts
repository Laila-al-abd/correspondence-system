import { IQueryHandler } from '@nestjs/cqrs';
import type { RequestQueryPort } from '../../ports/request-query.port';
import { KeysetPage } from '../../../shared/pagination';
import { ListHitlQueueQuery } from './list-hitl-queue.query';
import { RequestSummaryView } from '../views/request.view';
export declare class ListHitlQueueHandler implements IQueryHandler<ListHitlQueueQuery, KeysetPage<RequestSummaryView>> {
    private readonly requests;
    constructor(requests: RequestQueryPort);
    execute(query: ListHitlQueueQuery): Promise<KeysetPage<RequestSummaryView>>;
}
